import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL 
});

export const getKPISummary = () => api.get("/kpis/summary");
export const getKPITrends = () => api.get("/kpis/trends");

export default api;