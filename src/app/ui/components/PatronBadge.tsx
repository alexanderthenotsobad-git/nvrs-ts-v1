// /var/www/html/nvrs-ts-v1-ai-v1/src/app/components/PatronBadge.tsx

"use client";

import { useUserRole } from '../context/UserContext';

export default function PatronBadge() {
    const { currentPatron } = useUserRole();

    if (!currentPatron) return null;

    const displayName = currentPatron.patron_name.length > 10
        ? currentPatron.patron_name.substring(0, 10) + '…'
        : currentPatron.patron_name;

    return (
        <div className="fixed bottom-4 left-4 z-40 bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg text-sm flex items-center gap-2">
            <span className="text-xs">👤</span>
            <span className="font-medium max-w-[80px] truncate">
                {displayName}
            </span>
        </div>
    );
}