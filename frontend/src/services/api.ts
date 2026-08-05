import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL 
});

export const getKPISummary = () => api.get("/kpis/summary");
export const getKPITrends = () => api.get("/kpis/trends");
export const getReportTypes = () => api.get("/reports/types");
export const generateReport = (reportType: string) => api.post("/reports/generate", { report_type: reportType });
export const getReports = () => api.get("/reports");
export const deleteReport = (reportId: string) => api.delete(`/reports/${reportId}`);
export default api;