"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Form } from "lucide-react";
import api from "@/services/api";

export default function UploadsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [inserted, setInserted] = useState<number | null>(null);

    const handleFileChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected){
             setFile(selected);
             setStatus("idle")
             setMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus("uploading");
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/kpis/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setStatus("success");
            setInserted(response.data.inserted);
            setMessage(response.data.message);
        } catch (error: any) {
            setStatus("error");
            setMessage(error.response?.data?.message || "Upload failed");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">Data Uploads</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Upload CSV files containing your data. The system will process the file and insert the records into the database. Supported formats: CSV. Max file size: 10MB.
                </p>
            </div>

            {/*Upload Card*/}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400">
                        Upload KPI CSV File
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/*File input area and status */}
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
                        <Upload size={32} className="mx-auto text-slate-500 mb-3"/>
                        <p className="text-slate-400 text-sm mb-2">
                            Select a CSV file to upload. 
                        </p>
                        <p className="text-slate-400 text-xs mb-4">
                            Required columns: date, revenue, expenses, ebitda, cash_flow
                        </p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input"
                        />
                        <label
                            htmlFor="file-input"
                            className="curser-pointer inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                        >
                            Choose File
                        </label>
                        {file && (
                            <p className="text-slate-300 text-sm mt-3">
                                Selected: <span className="text-blue-400">{file.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Upload button */}
                    <Button
                        onClick={handleUpload}
                        disabled={!file || status === "uploading"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {status === "uploading" ? "Uploading..." : "Upload CSV"}
                    </Button>

                    {/* Status message */}
                    {status === "success" && (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
                            <CheckCircle size={16} />
                            <p className="text-sm">
                                {message} - {inserted} records inserted.
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-3 rounded-lg">
                            <AlertCircle size={16} />
                            <p className="text-sm">{message}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Format Guide */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-400">
                        CSV Format Guide
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400 text-sm mb-3">
                        Your CSV file should include the following columns:
                    </p>
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300">
                        date,revenue,expenses,ebitda,cash_flow
                        <br />
                        2024-01-01,1200000,850000,350000,280000
                        <br />
                        2024-02-01,1300000,900000,400000,320000
                    </div>
                    <p className="text-slate-500 text-sm mt-3">
                        Note: Uploading a new file will replace existing data for the same dates. Ensure your data is accurate and properly formatted to avoid errors during processing.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
    //Finish this portion
}