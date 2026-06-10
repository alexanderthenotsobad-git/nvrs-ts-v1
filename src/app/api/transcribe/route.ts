import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file' }, { status: 400 });
        }

        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-large-v3-turbo",
            language: "en",
            response_format: "text",
        });

        return NextResponse.json({ text: transcription });

    } catch (error) {
        console.error('Groq error:', error);
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }
}