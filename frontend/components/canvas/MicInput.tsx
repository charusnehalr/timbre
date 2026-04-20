'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

interface MicInputProps {
  onTranscript: (text: string) => void;
  token: string;
}

export function MicInput({ onTranscript, token }: MicInputProps) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function toggle() {
    if (recording) {
      mediaRef.current?.stop();
      setRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const text = await apiClient.transcribe(token, blob);
      onTranscript(text);
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setRecording(true);
  }

  return (
    <button
      onClick={toggle}
      title={recording ? 'Stop recording' : 'Record audio'}
      className={`p-2 rounded border ${recording ? 'bg-red-100 border-red-400' : 'hover:bg-gray-100'}`}
    >
      🎙
    </button>
  );
}
