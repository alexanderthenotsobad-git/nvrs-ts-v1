// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/FloatingAIChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatHistoryEntry {
    role: string;
    parts: { text: string }[];
}

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    chatHistory: chatHistory
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantMessage += chunk;

                    setMessages(prev => {
                        const newMessages = [...prev];
                        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
                            newMessages[newMessages.length - 1].content = assistantMessage;
                        }
                        return newMessages;
                    });
                }
            }

            setChatHistory(prev => [
                ...prev,
                { role: 'user', parts: [{ text: userMessage }] },
                { role: 'model', parts: [{ text: assistantMessage }] }
            ]);

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request aborted');
                return;
            }
            console.error('Chat error:', error);

            let errorText = 'Sorry, I encountered an error. Please try again.';
            if (error instanceof Error) {
                errorText = `Error: ${error.message}`;
            }

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: errorText }
            ]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const clearChat = () => {
        setMessages([]);
        setChatHistory([]);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    width: '56px',
                    height: '56px',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Open AI Dietary Consultant"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '28px', height: '28px' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            </button>

            {/* Floating Chat Modal */}
            {isOpen && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 9998,
                        }}
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        style={{
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            width: 'min(380px, calc(100vw - 40px))',
                            height: 'min(600px, calc(100vh - 100px))',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 9999,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '16px',
                                borderBottom: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '24px' }}>🧑‍⚕️</span>
                                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Dietary Consultant</h2>
                                <span style={{ fontSize: '10px', backgroundColor: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '9999px' }}>
                                    AI
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {messages.length === 0 ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        textAlign: 'center',
                                        color: '#6b7280',
                                    }}
                                >
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Ask me about our menu</h3>
                                    <p style={{ fontSize: '12px', maxWidth: '280px' }}>
                                        I can help with recommendations, allergens, macros such as protein nutritional info, ingredients
                                    </p>
                                    <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => setInput("What's low in calories?")}
                                            style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                                        >
                                            Low calorie options
                                        </button>
                                        <button
                                            onClick={() => setInput("Do you have vegetarian dishes?")}
                                            style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                                        >
                                            Vegetarian dishes
                                        </button>
                                        <button
                                            onClick={() => setInput("What's in the Shrimp Scampi?")}
                                            style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                                        >
                                            Shrimp Scampi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '80%',
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                backgroundColor: message.role === 'user' ? '#3B82F6' : '#f3f4f6',
                                                color: message.role === 'user' ? 'white' : '#111827',
                                                fontSize: '14px',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ backgroundColor: '#f3f4f6', padding: '8px 12px', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <span style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                                            <span style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></span>
                                            <span style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area with Clear, Close, Input, Send */}
                        <form onSubmit={sendMessage} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={clearChat}
                                    style={{
                                        backgroundColor: '#6B7280',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    aria-label="Clear chat"
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about menu items..."
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    style={{
                                        backgroundColor: '#3B82F6',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: isLoading || !input.trim() ? 0.5 : 1,
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
        </>
    );
}