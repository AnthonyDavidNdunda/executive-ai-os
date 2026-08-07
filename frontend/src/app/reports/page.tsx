"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getReportTypes, generateReport, getReports, deleteReport } from "@/services/api";
import remarkGfm from "remark-gfm";
import { withRetry } from "@/services/retry";

interface ReportType {
    id: string;
    title: string;
}

interface Report {
    id: number;
    report_type: string;
    title: string;
    content: string;
    sources: string | null;
    created_at: string;
}

const parseSources = (raw?: string | null): string[] => {
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

export default function ReportsPage() {
    const [types, setTypes] = useState<ReportType[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [selected, setSelected] = useState<Report | null>(null);
    const [generatingType, setGeneratingType] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [waking, setWaking] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [typesRes, reportsRes] = await withRetry(
                    () => Promise.all([getReportTypes(), getReports()]),
                    { onRetry: () => setWaking(true) }
                );
                setTypes(typesRes.data);
                setReports(reportsRes.data);
                if (reportsRes.data.length > 0) setSelected(reportsRes.data[0]);
                setWaking(false);
            } catch (err) {
                console.error("Failed to load reports", err)
                setLoadFailed(true);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleGenerate = async (typeId: string) => {
        setGeneratingType(typeId);
        setError("");

        try {
            const res = await generateReport(typeId);
            setReports((prev) => [res.data, ...prev]);
            setSelected(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to generate report");
        } finally {
            setGeneratingType(null);
        }
    };

    const handleDelete = async (reportId: number) => {
        try {
            await deleteReport(reportId.toString());
            setReports((prev) => prev.filter((r) => r.id !== reportId));
            if (selected?.id === reportId) setSelected(null);
        } catch (err) {
            console.error("Failed to delete report", err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">Report</h2>
                <p className="text-slate-400 text-sm mt-1">
                    AI-generated executive reports grounded in your KPI data and documents
                </p>
            </div>

            {loading && waking && (
                <p className="text-slate-500 text-sm">
                    Waking up the backend from idle. This can take up to a minute on first load.
                </p>
            )}

            {loadFailed && (
                <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle size={16} className="text-slate-500" />
                    <span>Couldn&apos;t reach the backend.</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-400 hover:text-blue-500 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/*Generate buttons*/}
            <div className="flex flex-wrap gap-3">
                {types.map((type) => (
                    <Button
                        key={type.id}
                        onClick={() => handleGenerate(type.id)}
                        disabled={generatingType !== null || types.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                        {generatingType === type.id ? (
                            <>
                            <Loader2 size={14} className="mr-2 animate-spin" />
                            Generating...
                            </>
                        ) : (
                            <>Generate {type.title}</>
                        )}
                    </Button>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/*Report list*/}
                <Card className="bg-slate-900 border-slate-800 xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-400">
                            Past Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {loading && (
                            <p className="text-slate-600 text-sm text-center py-4">Loading...</p>
                        )}
                        {!loading && reports.length === 0 && (
                            <p className="text-slate-600 text-sm text-center py-4">
                                No reports generated yet
                            </p>
                        )}
                        {reports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => setSelected(report)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                                    selected?.id === report.id
                                    ? "bg-blue-600/20 border border-blue-600/50"
                                    : "bg-slate-800 hover:bg-slate-700 border border-transparent"
                                }`}
                            >
                                <p className="text-slate-200 text-sm font-medium">{report.title}</p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                    {new Date(report.created_at).toLocaleString()}
                                </p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/*Report detail */}
                <Card className="bg_slate-900 border-slate-800 text-slate-200 xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <FileText size={16} />
                            {selected ? selected.title : "Select a report to view"}
                        </CardTitle>
                        {selected &&(
                            <button
                                onClick={() => handleDelete(selected.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selected && (
                            <p className="text-slate-600 text-sm text-center py-8">
                                Generate a report or select one from the list to view its content
                            </p>
                        )}
                        {selected && (
                            <>
                            <div className="text-slate-200 text-sm [&_h1]:text-white {&_h1]:font-semibold [&_h1]:text-lg [&_h1]:mb-3 [&_h2]:text-white [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-2 [&_strong]:text-white [&_strong]:font-semibold [&_table]:w-full [&_table]:my-3 [&-th]:text-left [&_th]:text-slate-400 [&_th]:border-b [&_th]:border-slate-700 [&_th]:pb-1.5 [&_td]:border-b [&-td]:border-slate-800 [&_td]:py-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_p]:mb-2 [&_li]:text-slate-300">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selected.content}
                                </ReactMarkdown>
                            </div>

                            {parseSources(selected.sources).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
                                    {parseSources(selected.sources).map((source) => (
                                        <span
                                        key = {source}
                                        className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700"
                                        >
                                            <FileText size={11} />
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="text-slate-600 text-xs mt-4 pt-4 border-t border-slate-800">
                                AI-generated. Please review before circulating.
                            </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}