"use client"

import ReactMarkdown from "react-markdown";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import api from "@/services/api";

interface Message {
    id: number;
    user_message: string;
    ai_response: string;
    created_at: string;
}

const SUGGESTED_PROMPTS = [
    "Why did EBITDA decrease in Q2?",
    "Summarize overall financial performance for the last quarter.",
    "What trends should leadership monitor?",
    "Which month had the strongest margins?",
    "How is cash flow trending?",
];

export default function CopilotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadHistory() {
            try {
                const response = await api.get("/chat/history");
                setMessages(response.data.reverse());
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setFetching(false);
            }
        }
        loadHistory();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;
        
        setInput("");
        setLoading(true);

        const placeholder: Message = {
            id: Date.now(),
            user_message: text, 
            ai_response: "Analyzing...",
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, placeholder]);

        try {
            const response = await api.post("/chat/message", { message: text });
            setMessages((prev) =>
                prev.map((msg) => (msg.id === placeholder.id ? response.data : msg))
            );
        } catch (error) {
            setMessages((prev) => 
                prev.map((msg) =>
                    msg.id === placeholder.id ? 
                    {...msg, ai_response: "Sorry, something went wrong. Please try again" }
                    : msg
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") sendMessage(input);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div>
                <h2 className="text-2xl font-semibold text-white">AI Copilot</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Ask business questions and receive executive-grade insights
                </p>
            </div>

            {/* Suggested Prompts */}
            <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Chat Window */}
            <Card className="bg-slate-900 border-slate-800 flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b border-slate-800 pb-3">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Bot size={16} />
                        Executive Financial Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {fetching && (
                        <p className="text-slate-500 text-sm text-center">
                            Loading chat history...
                        </p>
                    )}
                    {!fetching && messages.length === 0 && (
                        <p className="text-slate-500 text-sm text-center mt-8">
                            Ask a business question to get started. Try one of the suggested prompts above!
                        </p>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className="space-y-3">
                            {/* User Message */}
                            <div className="flex items-start gap-3 justify-end">
                                <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg max-w-xl">
                                    {msg.user_message}
                                </div>
                                <div className="bg-slate-700 p-1.5 rounded-full">
                                    <User size={14} className="text-slate-300" />
                                </div>
                            </div>
                            {/* AI Response */}
                            <div className="flex items-start gap-3">
                                <div className="bg-slate-700 p-1.5 rounded-full mt-1">
                                    <Bot size={14} className="text-blue-400" />
                                </div>
                                <div className="bg-slate-800 text-slate-200 text-sm px-4 py-3 rounded-lg max-w-xl [&_h2]: text-white [&_h2]:font-semibold [&_h2]:text_base [&_h2]:mb-2 [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:text-white [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_p]:mb-2 [&_li]:text-slate-300">
                                    <ReactMarkdown>{msg.ai_response}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </CardContent>

                {/* Input Area */}
                <div className="border-t border-slate-800 p-4 flex gap-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a business question..."
                        className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
                        disabled={loading}
                    />
                    <Button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Send size={16} />
                        </Button>
                </div>
            </Card>
        </div>
    );
}