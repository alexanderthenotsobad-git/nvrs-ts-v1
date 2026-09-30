// src/app/components/DietaryConsultant.tsx
'use client';

import React, { useState } from 'react';

export default function DietaryConsultant() {
    const [input, setInput] = useState('');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);

    const askExpert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();
            setReply(data.reply || data.error);
        } catch {
            // FIX: Dropped the unused 'err' node argument declaration completely
            setReply('Failed to make contact with the expert.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 border border-zinc-200 rounded-lg max-w-md my-4 bg-white shadow-sm">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-black">
                🧑‍⚕️ Dietary Consultant
            </h3>
            <form onSubmit={askExpert} className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about macros, allergies, or dishes..."
                    className="flex-1 p-2 border border-zinc-300 rounded text-black bg-zinc-50"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-zinc-400"
                >
                    {loading ? 'Analyzing...' : 'Consult'}
                </button>
            </form>
            {reply && (
                <div className="mt-4 p-3 bg-zinc-50 rounded border border-zinc-100 text-zinc-700 text-sm whitespace-pre-line">
                    <span className="font-semibold text-zinc-900">Advice:</span> {reply}
                </div>
            )}
        </div>
    );
}
