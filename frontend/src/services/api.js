const API_URL = "http://127.0.0.1:8000";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Backend request failed (${response.status})`);
  }
  return await response.json();
}

export async function createConversation() {
  return requestJson("/conversations", { method: "POST" });
}

export async function fetchConversation(conversationId) {
  return requestJson(`/conversations/${conversationId}`);
}

export async function fetchConversationMessages(conversationId) {
  return requestJson(`/conversations/${conversationId}/messages`);
}

export async function resetConversation(conversationId) {
  return requestJson(`/conversations/${conversationId}/reset`, { method: "POST" });
}

export async function submitFeedback(conversationId, rating, label) {
  return requestJson(`/conversations/${conversationId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, label }),
  });
}

export async function submitTicketFeedback(ticketId, rating, label, emoji = null) {
  return requestJson(`/tickets/${ticketId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, label, emoji }),
  })
}

export async function fetchTicketFeedback(ticketId) {
  return requestJson(`/tickets/${ticketId}/feedback`)
}

export async function submitTicketFeedbackSkip(ticketId) {
  return requestJson(`/tickets/${ticketId}/feedback/skip`, {
    method: 'POST',
  })
}

export async function uploadChatFile(conversationId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}/conversations/${conversationId}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Upload failed (${response.status})`);
  }
  return await response.json();
}

export async function sendUserMessage(conversationId, message) {
  return requestJson(`/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

export async function askAgent(query, conversationId) {
  return requestJson("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversation_id: conversationId }),
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
  return requestJson(`/tickets/${ticketId}/close`, { method: "POST" });
}

export async function fetchTrendingIssues() {
  return requestJson("/trending-issues");
}

export async function fetchKnowledgeBase() {
  return requestJson("/knowledge-base");
}

export async function fetchKnowledgeBaseDoc(docId) {
  return requestJson(`/knowledge-base/${docId}`);
}

export async function createKnowledgeBaseDoc(title, content) {
  return requestJson("/knowledge-base", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
}

export async function updateKnowledgeBaseDoc(docId, title, content) {
  return requestJson(`/knowledge-base/${docId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
}

export async function deleteKnowledgeBaseDoc(docId) {
  return requestJson(`/knowledge-base/${docId}`, { method: "DELETE" });
}

export async function uploadKnowledgeBaseFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}/knowledge-base/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Upload failed (${response.status})`);
  }
  return await response.json();
}

export function getUploadUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export const API_BASE = API_URL;
