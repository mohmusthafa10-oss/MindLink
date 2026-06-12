import api from "./api";

export const sendChat = (message, mode = "companion", session_id = null, image = null) => {
  return api.post("/chat/message", { message, mode, session_id, image });
};

export const getSessions = () => {
  return api.get("/sessions/");
};

export const getSessionMessages = (id) => {
  return api.get(`/sessions/${id}/messages`);
};

export const deleteSession = (id) => {
  return api.delete(`/sessions/${id}`);
};

export const getChatHistory = () => {
  return api.get("/chat");
};
