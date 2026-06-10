// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/FloatingChatButton.tsx
'use client';

import React from 'react';

interface FloatingChatButtonProps {
    onClick: () => void;
}

export default function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
    return (
        <button
            onClick={onClick}
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
    );
}