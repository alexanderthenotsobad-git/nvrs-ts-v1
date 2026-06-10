// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/ChatMessages.tsx
'use client';

import React from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatMessagesProps {
    messages: Message[];
    isLoading: boolean;
    onExampleClick: (text: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({ messages, isLoading, onExampleClick, messagesEndRef }: ChatMessagesProps) {
    if (messages.length === 0) {
        return (
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
                <div style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '8px', borderRadius: '8px', marginTop: '16px', marginBottom: '16px' }}>
                    🎤 Click the mic button, speak your question, then click send
                </div>
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    <button
                        onClick={() => onExampleClick("What's low in calories?")}
                        style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        Low calorie options
                    </button>
                    <button
                        onClick={() => onExampleClick("Do you have vegetarian dishes?")}
                        style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        Vegetarian dishes
                    </button>
                    <button
                        onClick={() => onExampleClick("What's in the Shrimp Scampi?")}
                        style={{ fontSize: '10px', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        Shrimp Scampi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {messages.map((message, index) => (
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
            ))}
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
            <style jsx>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </>
    );
}