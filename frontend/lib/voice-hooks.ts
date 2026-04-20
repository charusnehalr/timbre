'use client';

import { useState, useRef, useCallback } from 'react';
import { apiClient } from './api-client';

export function useMic() {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.start();
    setRecording(true);
    return { stream, recorder };
  }, []);

  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) return;
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: 'audio/webm' }));
        setRecording(false);
      };
      recorder.stop();
    });
  }, []);

  return { recording, start, stop };
}

export function useTranscription(token: string) {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const transcribe = useCallback(
    async (blob: Blob) => {
      setLoading(true);
      try {
        const text = await apiClient.transcribe(token, blob);
        setTranscript(text);
        return text;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  return { transcript, loading, transcribe };
}
