const API_URL = "http://127.0.0.1:8000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status})`);
  }
  return await response.json();
}

export async function askAgent(query) {
  return requestJson("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
}

export async function fetchTickets() {
  return requestJson("/tickets");
}

export async function fetchTicketMessages(ticketId) {
  return requestJson(`/tickets/${ticketId}/messages`);
}

export async function takeoverTicket(ticketId, agentName) {
  return requestJson(`/tickets/${ticketId}/takeover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent_name: agentName }),
  });
}

export async function replyTicket(ticketId, sender, message) {
  return requestJson(`/tickets/${ticketId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, message }),
  });
}

export async function closeTicket(ticketId) {
  return requestJson(`/tickets/${ticketId}/close`, {
    method: "POST",
  });
}
