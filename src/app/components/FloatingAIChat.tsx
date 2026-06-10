// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/FloatingAIChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import FloatingChatButton from '@/components/FloatingChatButton';

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, isLoading, sendMessage, clearChat } = useChat();

    const handleTranscribed = (text: string) => {
        setInput(text);
        // User must click Send manually
    };
    const { isRecording, startRecording, stopRecording } = useVoiceRecorder(handleTranscribed);

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

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input, () => setInput(''));
    };

    const handleExampleClick = (text: string) => {
        setInput(text);
        setTimeout(() => {
            if (inputRef.current?.form) {
                const event = new Event('submit', { bubbles: true });
                inputRef.current.form?.dispatchEvent(event);
            }
        }, 50);
    };

    return (
        <>
            <FloatingChatButton onClick={() => setIsOpen(true)} />

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
                            <ChatMessages
                                messages={messages}
                                isLoading={isLoading}
                                onExampleClick={handleExampleClick}
                                messagesEndRef={messagesEndRef}
                            />
                        </div>

                        {/* Input Area */}
                        <ChatInput
                            input={input}
                            setInput={setInput}
                            isLoading={isLoading}
                            isRecording={isRecording}
                            onSend={handleSend}
                            onClear={clearChat}
                            onClose={() => setIsOpen(false)}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            inputRef={inputRef}
                        />
                    </div>
                </>
            )}
        </>
    );
}