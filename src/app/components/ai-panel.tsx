"use client";

import { Send, X, Sparkles, Loader2, MessageSquare, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect, FormEvent } from "react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  "High protein",
  "No shellfish",
  "Under 600 cal",
  "Vegetarian",
  "Something spicy",
];

export function AIPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Focus textarea on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && recording) {
      stopRecording();
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setStreaming(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          chatHistory: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: Date.now() }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: assistantContent };
          return next;
        });
      }
    } catch (err) {
      setError("The menu expert is unavailable. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    handleSubmit({ preventDefault: () => {} } as any);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await transcribeAudio(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorderRef.current = recorder;
      setAudioChunks(chunks);
      recorder.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const transcribeAudio = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transcription failed');
      }
      
      const { text } = await res.json();
      if (text?.trim()) {
        setInput(prev => prev + (prev ? ' ' : '') + text.trim());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-cream shadow-lift transition-transform duration-300",
          "bottom-0 inset-x-0 rounded-t-[2rem] max-h-[92dvh] md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[430px] md:rounded-none",
          isOpen ? "translate-y-0" : "translate-y-full md:translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu Expert"
      >
        <div className="safe-bottom shrink-0 border-b border-line bg-cream/95 px-4 pb-2 pt-2 backdrop-blur sm:px-5">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line md:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-olive-soft text-olive">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Menu expert</p>
                <p className="text-[10px] text-muted">High protein, no shellfish, under 600 cal…</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-cream-deep hover:text-ink"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted py-8">
              <MessageSquare className="size-12 text-muted/30 mb-3" />
              <p className="font-display text-lg font-semibold">What are you in the mood for?</p>
              <p className="mt-1 text-sm max-w-xs">Tell me your goals — protein targets, allergies, macros — and I'll find the right plate.</p>
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-line bg-cream px-3 py-1.5 text-[10px] font-bold text-muted hover:bg-cream-deep hover:text-ink"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}>
              {msg.role === "assistant" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-olive-soft text-olive">
                  <Sparkles className="size-3.5" />
                </div>
              )}
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", msg.role === "user" ? "bg-ink text-cream rounded-br-md" : "bg-cream-deep text-ink rounded-bl-md")}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-butter-soft text-butter" />}
            </div>
          ))}

          {streaming && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-olive-soft text-olive animate-pulse">
                <Loader2 className="size-3.5" />
              </div>
              <div className="rounded-2xl bg-cream-deep px-4 py-2.5 rounded-bl-md">
                <div className="flex items-center gap-1.5 text-muted">
                  <Loader2 className="size-4 animate-spin" />
                  <span>The menu expert is thinking…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="safe-bottom shrink-0 border-t border-line bg-cream px-4 pb-3 pt-3 sm:px-5">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="High protein, no shellfish, under 600 cal…"
              aria-label="Ask the menu expert"
              rows={1}
              className="flex-1 min-h-[44px] max-h-[120px] rounded-xl border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-ink/30 focus:outline-none resize-none"
              disabled={streaming}
            />
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={streaming}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                recording
                  ? "bg-tomato text-cream animate-pulse"
                  : "bg-olive text-cream hover:bg-olive/90"
              )}
              aria-label={recording ? "Stop recording" : "Start voice input"}
            >
              {recording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                streaming || !input.trim()
                  ? "bg-line text-muted cursor-not-allowed"
                  : "bg-ink text-cream hover:bg-ink/90"
              )}
              aria-label="Send"
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
          {error && <p className="mt-2 text-[10px] text-tomato-deep text-center">{error}</p>}
        </form>
      </aside>
    </>
  );
}
