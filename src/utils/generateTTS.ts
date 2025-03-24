import AWS from "aws-sdk";
import fs from "fs";
import path from "path";

export async function generateTTS(
  text: string,
  fileName: string
): Promise<string> {
  const polly = new AWS.Polly({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    OutputFormat: "mp3",
    Text: text,
    VoiceId: "Joanna",
  };

  const result = await polly.synthesizeSpeech(params).promise();

  const outputPath = path.join(__dirname, "..", "..", "temp", fileName);
  fs.writeFileSync(outputPath, result.AudioStream as Buffer);

  return outputPath;
}
