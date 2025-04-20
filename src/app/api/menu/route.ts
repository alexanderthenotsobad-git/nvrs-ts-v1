import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://api.alexanderthenotsobad.us/');
        if (!response.ok) {
            throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API proxy error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch menu items' },
            { status: 500 }
        );
    }
}