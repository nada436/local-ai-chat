// components/AudioRecorder.jsx
// -----------------------------------------------------------------------------
// WHY THIS COMPONENT EXISTS
// Frontend half of speech-to-text. Uses the browser's native MediaRecorder
// API (no external library needed) to capture microphone audio, then posts
// the resulting Blob to /api/audio, where the backend runs it through a
// LOCAL Whisper model. The returned transcript is handed to the parent
// (ChatInput) which drops it straight into the text box — exactly like the
// mic button in the reference "Smart Chat" UI screenshot.
// -----------------------------------------------------------------------------
import { useRef, useState } from 'react';
import { uploadAudio } from '../api/chatApi.js';

export default function AudioRecorder({ onTranscribed }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

      setTranscribing(true);
      try {
        const { text } = await uploadAudio(blob);
        onTranscribed?.(text);
      } finally {
        setTranscribing(false);
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={transcribing}
      className={`p-2 rounded-lg transition-colors ${
        recording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-surface-light'
      }`}
      title={recording ? 'Stop recording' : 'Record audio'}
    >
      {transcribing ? '⏳' : recording ? '⏹️' : '🎙️'}
    </button>
  );
}
