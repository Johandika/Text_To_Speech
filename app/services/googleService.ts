const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const path = require("path");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "tts.json";
const client = new textToSpeech.TextToSpeechClient();

const usageFilePath = path.join(__dirname, "characterUsage.json");

// Load usage data from file or initialize it
let usageData: any;
if (fs.existsSync(usageFilePath)) {
  usageData = JSON.parse(fs.readFileSync(usageFilePath, "utf8"));
} else {
  usageData = { totalCharactersUsed: 0, lastReset: new Date().toISOString() };
}

async function transformTextToSpeechWithGoogle(
  inputFilePath: any,
  outputFile: any
) {
  try {
    // Read text from input file
    const text = fs.readFileSync(inputFilePath, "utf8").trim();

    const currentDate = new Date();
    const lastResetDate = new Date(usageData.lastReset);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    // Reset usage data if it's been more than a month since the last reset
    if (lastResetDate < oneMonthAgo) {
      usageData.totalCharactersUsed = 0;
      usageData.lastReset = currentDate.toISOString();
    }

    const request = {
      input: { text },
      voice: {
        languageCode: "id-ID",
        name: "id-ID-Wavenet-B",
        ssmlGender: "MALE",
      },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);

    fs.writeFileSync(outputFile, response.audioContent, "binary");

    usageData.totalCharactersUsed += text.length;
    console.log(
      `Total characters used this month: ${usageData.totalCharactersUsed}`
    );

    if (usageData.totalCharactersUsed > 1000000) {
      console.log(
        "Warning: You have used more than 1 million characters this month."
      );
    }

    // Save updated usage data to file
    fs.writeFileSync(usageFilePath, JSON.stringify(usageData), "utf8");

    return outputFile;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

(async () => {
  try {
    const inputFilePath = path.join(__dirname, "text.txt");
    await transformTextToSpeechWithGoogle(inputFilePath, "output3.mp3");
    console.log("Audio file created successfully.");
  } catch (error) {
    console.error("Failed to create audio file:", error);
  }
})();

module.exports = {
  transformTextToSpeechWithGoogle,
};
