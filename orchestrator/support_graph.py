from typing import NotRequired, TypedDict

from langgraph.graph import StateGraph, START, END

from agents.intent_detection import detect_intent
from agents.conversation_agent import conversation_agent
from agents.response_agent import response_agent
from agents.hallucination_guard import hallucination_guard
from agents.policy_compliance import policy_compliance
from agents.escalation_agent import escalation_decision

from services.retrieval import retrieve
from services.logger import (
    save_interaction,
    save_intent_log
)


class SupportState(TypedDict):

    query: str

    intent: dict

    response: dict

    verification: NotRequired[dict]

    compliance: NotRequired[dict]

    escalation: NotRequired[dict]


# -----------------------------
# Intent Agent
# -----------------------------

def intent_node(state: SupportState):

    result = detect_intent(
        state["query"]
    )

    return {
        "intent": result
    }

# -----------------------------
# Conversation Agent
# -----------------------------
def conversation_node(state):

    result = conversation_agent.process(
        state["query"]
    )

    return {
        **state,
        "response": result,
        "current_agent": "conversation_agent"
    }

# -----------------------------
# Resolution Agent
# -----------------------------

def response_node(state: SupportState):

    result = response_agent(
        state["query"]
    )

    return {
        "response": result
    }


# -----------------------------
# Governance Agent
# Hallucination Check
# -----------------------------

def hallucination_node(state: SupportState):

    retrieved_chunks = retrieve(
        state["query"]
    )

    context = "\n\n".join(
        [chunk["text"] for chunk in retrieved_chunks]
    )

    verification = hallucination_guard(
        question=state["query"],
        answer=state["response"]["answer"],
        context=context,
        sources_total=len(retrieved_chunks)
    )

    return {
        "verification": verification
    }


# -----------------------------
# Governance Agent
# Policy Compliance
# -----------------------------

def policy_node(state: SupportState):

    compliance = policy_compliance(
        question=state["query"],
        answer=state["response"]["answer"]
    )

    return {
        "compliance": compliance
    }


# -----------------------------
# Escalation Agent
# -----------------------------

def escalation_node(state: SupportState):

    verification = state.get(
        "verification",
        {
            "status": "SUPPORTED",
            "confidence": 100
        }
    )

    compliance = state.get(
        "compliance",
        {
            "risk": "LOW"
        }
    )

    escalation = escalation_decision(

        query=state["query"],

        intent=state["intent"]["intent"],

        hallucination_status=
        verification["status"],

        hallucination_confidence=
        verification["confidence"],

        policy_risk=
        compliance["risk"]
    )

    return {
        "escalation": escalation
    }


# -----------------------------
# Logging Agent
# -----------------------------

from services.logger import (
    save_interaction,
    save_intent_log
)


def logging_node(state: SupportState):

    save_interaction(

        query=
        state["query"],

        intent=
        state["intent"],

        answer=
        state["response"]["answer"],

        verification=
        state.get(
            "verification",
            {
                "status": "SUPPORTED",
                "confidence": 100
            }
        ),

        compliance=
        state.get(
            "compliance",
            {
                "risk": "LOW"
            }
        ),

        escalation=
        state.get(
            "escalation",
            {
                "escalate": False
            }
        )
    )

    save_intent_log(
        state["intent"]
    )

    return {
        "escalation": state.get(
            "escalation",
            {
                "escalate": False
            }
        )
    }
# -----------------------------
# Build Graph
# -----------------------------

def route_after_intent(state):

    intent = state["intent"]["intent"]

    print("\nROUTER RECEIVED:", intent)

    conversation_intents = [
        "GREETING",
        "SMALL_TALK",
        "THANK_YOU",
        "GOODBYE",
        "CONVERSATION"
    ]

    if intent in conversation_intents:
        return "conversation_agent"

    return "response_agent"
def route_after_response(state):

    intent = state["intent"]["intent"]

    if intent in ["FAQ", "HR_QUERY"]:
        return "logging_agent"

    if intent == "POLICY_QUERY":
        return "policy_agent"

    if intent == "IT_SUPPORT":
        return "escalation_agent"

    if intent in [
        "COMPLAINT",
        "ESCALATION_REQUEST"
    ]:
        return "hallucination_agent"

    return "logging_agent"


def route_after_hallucination(state):

    intent = state["intent"]["intent"]

    if intent == "COMPLAINT":
        return "escalation_agent"

    if intent == "ESCALATION_REQUEST":
        return "policy_agent"

    return "logging_agent"


def route_after_policy(state):

    intent = state["intent"]["intent"]

    if intent == "ESCALATION_REQUEST":
        return "escalation_agent"

    return "logging_agent"


builder = StateGraph(SupportState)

builder.add_node("intent_agent", intent_node)
builder.add_node("conversation_agent",conversation_node)
builder.add_node("response_agent", response_node)
builder.add_node("hallucination_agent", hallucination_node)
builder.add_node("policy_agent", policy_node)
builder.add_node("escalation_agent", escalation_node)
builder.add_node("logging_agent", logging_node)

builder.add_edge(START,"intent_agent")
builder.add_conditional_edges("intent_agent",route_after_intent)
builder.add_conditional_edges("response_agent", route_after_response)
builder.add_conditional_edges("hallucination_agent", route_after_hallucination)
builder.add_conditional_edges("policy_agent", route_after_policy)
builder.add_edge("conversation_agent","logging_agent")

builder.add_edge("escalation_agent", "logging_agent")
builder.add_edge("logging_agent", END)

graph = builder.compile()