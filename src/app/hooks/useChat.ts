// /var/www/html/nvrs-ts-v1-ai-v1/src/app/hooks/useChat.ts
import { useState, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatHistoryEntry {
    role: string;
    parts: { text: string }[];
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = async (input: string, onClearInput: () => void) => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        onClearInput();
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

    return { messages, isLoading, sendMessage, clearChat };
}