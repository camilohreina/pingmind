import fs from "fs";
import { Readable } from "stream";
import path from "path";
import { getTranscriptionFromAudio } from "@/lib/ai";

export const getTextFromAudio = async (
  audioFile: AsyncIterable<Uint8Array>,
) => {
  const fileBuffer = await handleAudioDownload(audioFile);
  const tmpDir = ensureTempDir();
  const audioPath = path.join(tmpDir, "audio.webm");
  await saveBufferToFile(fileBuffer, audioPath);
  const transcription = await getTranscriptionFromAudio(audioPath);
  return transcription;
  // Call OpenAI API for transcription
};

// Utility function to ensure a temporary directory exists
const ensureTempDir = () => {
  const tmpDir = process.platform === "win32" ? "C:\\tmp" : "/tmp";
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  return tmpDir;
};
// Utility function to convert Blob to AsyncIterable<Uint8Array>

const saveBufferToFile = async (buffer: Buffer, filePath: string) => {
  const stream = Readable.from(buffer);
  const writeStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    stream.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};

export async function handleAudioDownload(response: AsyncIterable<Uint8Array>) {
  const chunks = [];

  for await (const chunk of response) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);

  return buffer;
}
