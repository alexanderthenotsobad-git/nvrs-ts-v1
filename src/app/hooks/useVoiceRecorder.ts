// /var/www/html/nvrs-ts-v1-ai-v1/src/app/hooks/useVoiceRecorder.ts
import { useState, useRef } from 'react';

export function useVoiceRecorder(onTranscribed: (text: string) => void) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                stream.getTracks().forEach(track => track.stop());

                const response = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.text) {
                    onTranscribed(data.text);
                }
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);

            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }, 10000);

        } catch (err) {
            console.error('Microphone error:', err);
            alert('Please allow microphone access to use voice input.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    return { isRecording, startRecording, stopRecording };
}