"use client";
import React, { useEffect, useState } from 'react'

type Props = {}

export default function VoicePage({}: Props) {
    const [result, setResult] = useState(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    let chunks: BlobPart[] = [];
  
    useEffect(() => {
      if (typeof window === "undefined") return;
  
      // Request microphone access and set up MediaRecorder
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
  
          recorder.onstart = () => (chunks = []);
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => handleRecordingStop();
  
          setMediaRecorder(recorder);
        })
        .catch((err) => console.error("Error accessing microphone:", err));
    }, []);
  
    // Handle the stop recording event
    const handleRecordingStop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
  
      // Prepare FormData with the recorded audio
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
  
      try {
        const response = await fetch("/api/test/voice", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
  
        const data = await response.json();
        setResult(data.result);
      } catch (error) {
        console.error("Error during transcription:", error);
        alert("Failed to transcribe audio. Please try again.");
      }
    };
  
    const toggleRecording = () => {
      if (!mediaRecorder) return;
      if (recording) {
        mediaRecorder.stop();
      } else {
        mediaRecorder.start();
      }
      setRecording(!recording);
    };
  
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Convert audio to text <span className="text-blue-500">-&gt;</span>
          </h2>
          <button
            onClick={toggleRecording}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              recording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
          {result && <p className="mt-4 text-gray-600">{result}</p>}
        </div>
      </main>
    );
}