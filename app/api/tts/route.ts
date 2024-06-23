// import { NextRequest, NextResponse } from "next/server";
// import textToSpeech from "@google-cloud/text-to-speech";
// import fs from "fs";
// import path from "path";

// const client = new textToSpeech.TextToSpeechClient({
//   credentials: {
//     type: "service_account",
//     project_id: process.env.GOOGLE_PROJECT_ID,
//     private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
//     private_key: process.env.GOOGLE_PRIVATE_KEY,
//     client_email: process.env.GOOGLE_CLIENT_EMAIL,
//     client_id: process.env.GOOGLE_CLIENT_ID,
//   },
// });

// const usageFilePath = path.join(process.cwd(), "characterUsage.json");

// export async function POST(req: NextRequest) {
//   try {
//     const { inputText, selectVoice } = await req.json();

//     if (!inputText || !selectVoice) {
//       return NextResponse.json(
//         { message: "Missing inputText or selectVoice" },
//         { status: 400 }
//       );
//     }

//     let usageData;
//     if (fs.existsSync(usageFilePath)) {
//       usageData = JSON.parse(fs.readFileSync(usageFilePath, "utf8"));
//     } else {
//       usageData = {
//         totalCharactersUsed: 0,
//         lastReset: new Date().toISOString(),
//       };
//     }

//     const currentDate = new Date();
//     const lastResetDate = new Date(usageData.lastReset);
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(currentDate.getMonth() - 1);

//     if (lastResetDate < oneMonthAgo) {
//       usageData.totalCharactersUsed = 0;
//       usageData.lastReset = currentDate.toISOString();
//     }

//     const requestConfig = {
//       input: { text: inputText },
//       voice: {
//         languageCode: "id-ID",
//         name: selectVoice,
//         ssmlGender: "MALE",
//       },
//       audioConfig: { audioEncoding: "MP3" },
//     };

//     const [response] = await client.synthesizeSpeech(requestConfig);

//     usageData.totalCharactersUsed += inputText.length;
//     fs.writeFileSync(usageFilePath, JSON.stringify(usageData), "utf8");

//     // Mengembalikan file audio langsung sebagai respons
//     return new NextResponse(response.audioContent, {
//       status: 200,
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "Content-Disposition": 'attachment; filename="output.mp3"',
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json(
//       { message: "Failed to create audio file.", error: error.message },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const client = new TextToSpeechClient({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { inputText, selectVoice } = await req.json();

    if (!inputText || !selectVoice) {
      return NextResponse.json(
        { message: "Missing inputText or selectVoice" },
        { status: 400 }
      );
    }

    const requestConfig = {
      input: { text: inputText },
      voice: {
        languageCode: "id-ID",
        name: selectVoice,
        ssmlGender: "MALE" as const,
      },
      audioConfig: { audioEncoding: "MP3" as const },
    };

    const [response] = await client.synthesizeSpeech(requestConfig);

    if (!response.audioContent) {
      throw new Error("No audio content received");
    }

    // Mengembalikan file audio langsung sebagai respons
    return new NextResponse(response.audioContent, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="output.mp3"',
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        message: "Failed to create audio file.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
