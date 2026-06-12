import api from "./api";

export const saveMood = (mood) => api.post("/mood/add", { mood }); // Backend is /add

export const getMoodHistory = () => api.get("/mood/history");
