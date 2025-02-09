import { getTextFromImage } from "@/controllers/ai.controller";
import { getMediaInfobip } from "@/lib/infobip";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Validate Content-Type
    /*     const contentType = req.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid Content-Type' }, { status: 400 });
    }

    // Extract audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('file');
    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 400 });
    } */

    //const response:  AsyncIterable<Uint8Array> = await getMediaInfobip({ mediaId: "634318522333073" });

    //console.log(response);

    //const transcription = await getTextFromImage(response)
    //console.log(transcription);
    //const response  = await getAudioFromUrl('https://d9krvg.api.infobip.com/whatsapp/1/senders/447908679639/media/3966813530218966')

    // const transcription = await getTextFromAudio(response);
    // Convert audio file to a buffer and save to a temporary file
    //console.log(transcription);
    // Respond with transcription result
    return NextResponse.json({ result: "image to text" }, { status: 200 });
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
