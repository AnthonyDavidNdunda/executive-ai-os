"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, FileText, Trash2 } from "lucide-react";
import api from "@/services/api";


interface Document {
    id: number;
    filename: string;
    created_at: string;
}

export default function UploadsPage() {

    //CSV state
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvStatus, setCsvStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [csvMessage, setCsvMessage] = useState("");
    const [csvInserted, setCsvInserted] = useState<number | null>(null);

    //PDF state
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfStatus, setPdfStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [pdfMessage, setPdfMessage] = useState("");
    const [pdfInserted, setPdfInserted] = useState<Document[]>([]);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get("/documents");
            setPdfInserted(response.data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    const handleCsvFileChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected){
             setCsvFile(selected);
             setCsvStatus("idle")
             setCsvMessage("");
        }
    };

    const handleCsvUpload = async () => {
        if (!csvFile) return;

        setCsvStatus("uploading");
        setCsvMessage("");

        const formData = new FormData();
        formData.append("file", csvFile);

        try {
            const response = await api.post("/kpis/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setCsvStatus("success");
            setCsvInserted(response.data.inserted);
            setCsvMessage(response.data.message);
        } catch (error: any) {
            setCsvStatus("error");
            setCsvMessage(error.response?.data?.detail || "Upload failed");
        }
    };

    const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setPdfFile(selected);
            setPdfStatus("idle");
            setPdfMessage("");
        }
    };

    const handlePdfUpload = async () => {
        if (!pdfFile) return;
        setPdfStatus("uploading");
        const formData = new FormData();
        formData.append("file", pdfFile);
        try {
            const response = await api.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPdfStatus("success");
            setPdfMessage(`${response.data.message} - ${response.data.chunks} chunks processed`);
            fetchDocuments(); // Refresh the list of documents after upload
        } catch (error: any) {
            setPdfStatus("error");
            setPdfMessage(error.response?.data?.detail || "Upload failed");
        }
    };

    const handleDeleteDocument = async (id: number) => {
        try {
            await api.delete(`/documents/${id}`);
            setPdfInserted((prev) => prev.filter((doc) => doc.id !== id));
        } catch (error) {
            console.error("Failed to delete document:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">Data Uploads</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Upload KPI data and documents to power you AI copilot
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* CSV Upload Card */}
                <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-400">
                            KPI Data Upload (CSV)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                            <Upload size={28} className="mx-auto text-slate-500 mb-2" />
                            <p className="text-slate-400 text-sm mb-1">Upload KPI CSV File</p>
                            <p className="text-slate-600 text-xs mb-3">
                                Required: date, revenue, expenses, ebitda, cash_flow
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCsvFileChange}
                                className="hidden"
                                id="csv-input"
                            />
                            <label 
                                htmlFor="csv-input"
                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                            >
                                Choose CSV
                            </label>
                            {csvFile && (
                                <p className="text-slate-300 text-sm mt-2">
                                    Selected: <span className="text-blue-400">{csvFile.name}</span>
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={handleCsvUpload}
                            disabled={!csvFile || csvStatus === "uploading"}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {csvStatus === "uploading" ? "Uploading..." : "Upload CSV"}
                        </Button>
                        {csvStatus === "success" && (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
                                <CheckCircle size={16} />
                                <p className="text-sm">{csvMessage} - {csvInserted} records inserted</p>
                            </div>
                        )}
                        {csvStatus === "error" && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
                                <AlertCircle size={16} />
                                <p className="text-sm">{csvMessage}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* PDF Upload Card */}
                <Card className="bg-slate-900 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Document Upload (PDF)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                            <FileText size={28} className="mx-auto text-slate-500 mb-2" />
                            <p className="text-slate-400 text-sm mb-1">Upload PDF Documents</p>
                            <p className="text-slate-600 text-xs mb-3">
                                Earnings reports, presentations, contracts, board memos
                            </p>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handlePdfFileChange}
                                className="hidden"
                                id="pdf-input"
                            />
                            <label
                                htmlFor="pdf-input"
                                className="cursor-pointer inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                            >
                                Choose PDF
                            </label>
                            {pdfFile && (
                                <p className="text-slate-300 text-sm mt-2">
                                    Selected: <span className="text-blue-400">{pdfFile.name}</span>
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={handlePdfUpload}
                            disabled={!pdfFile || pdfStatus === "uploading"}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {pdfStatus === "uploading" ? "Uploading..." : "Upload PDF"}
                        </Button>
                        {pdfStatus === "success" && (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
                                <CheckCircle size={16} />
                                <p className="text-sm">{pdfMessage}</p>
                            </div>
                        )}
                        {pdfStatus === "error" && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
                                <AlertCircle size={16} />
                                <p className="text-sm">{pdfMessage}</p>
                            </div>
                        )}    
                    </CardContent>
                </Card>
            </div>

            {/* Document Library */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400">
                        Document Library
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pdfInserted.length === 0 ? (
                        <p className="text-slate-600 text-sm text-center py-4">
                            No documents uploaded yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {pdfInserted.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between bg-slate-800 px-4 py-3 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-blue-400" />
                                        <div>
                                            <p className="text-slate-200 text-sm">{doc.filename}</p>
                                            <p className="text-slate-500 text-xs">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );    
}