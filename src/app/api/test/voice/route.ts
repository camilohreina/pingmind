import { NextRequest, NextResponse } from 'next/server';
import { getTextFromAudio } from '@/controllers/ai.controller';

// API handler for POST requests
export async function POST(req: NextRequest) {
  try {
    // Validate Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
    }

    // Extract audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('file');
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 400 });
    }

    const transcription = await getTextFromAudio(audioFile as Blob);
    // Convert audio file to a buffer and save to a temporary file


    // Respond with transcription result
    return NextResponse.json({ result: transcription.text });
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}