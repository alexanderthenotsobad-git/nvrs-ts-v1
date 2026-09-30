// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/ChatInput.tsx
'use client';

import React from 'react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    isRecording: boolean;
    onSend: (e: React.FormEvent) => void;
    onClear: () => void;
    onClose: () => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ChatInput({
    input,
    setInput,
    isLoading,
    isRecording,
    onSend,
    onClear,
    onClose,
    onStartRecording,
    onStopRecording,
    inputRef
}: ChatInputProps) {
    return (
        <form onSubmit={onSend} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            {/* First row: Clear, Close, Mic, Stop Recording buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {/* Clear chat - Trash can */}
                <button
                    onClick={onClear}
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

                {/* Close modal - X in circle */}
                <button
                    onClick={onClose}
                    style={{
                        backgroundColor: '#EF4444',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    type="button"
                    aria-label="Close chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l-6 6m0-6l6 6" />
                    </svg>
                </button>

                {/* Start recording - Microphone */}
                <button
                    onClick={onStartRecording}
                    type="button"
                    style={{
                        backgroundColor: isRecording ? '#EF4444' : '#6B7280',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: isRecording ? 'not-allowed' : 'pointer',
                        opacity: isRecording ? 0.6 : 1,
                        animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                    }}
                    aria-label="Start voice input"
                    disabled={isRecording}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>

                {/* Stop recording - Microphone with slash */}
                {isRecording && (
                    <button
                        onClick={onStopRecording}
                        type="button"
                        style={{
                            backgroundColor: '#DC2626',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        aria-label="Stop recording"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Second row: Input field */}
            <div style={{ marginBottom: '12px' }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? "Recording..." : "Ask about menu items..."}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: isRecording ? '2px solid #EF4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                    disabled={isLoading}
                />
            </div>

            {/* Third row: Send button - full width */}
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: isLoading || !input.trim() ? 0.5 : 1,
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                    if (!isLoading && input.trim()) {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
                }}
            >
                {isLoading ? 'Sending...' : 'Send Message'}
            </button>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }
            `}</style>
        </form>
    );
}