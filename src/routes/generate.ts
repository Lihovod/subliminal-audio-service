import { Router } from "express";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { GenerateAudioRequest } from "../types";
import { generateTTS } from "../utils/generateTTS";
import { mergeAudioFiles } from "../utils/mergeAudio";
import { v4 as uuidv4 } from "uuid";
import { cleanTempFilesBySessionId } from "../utils/cleanTempFilesBySessionId";
import { sendAudioEmail } from "../utils/sendAudioEmail";

const router = Router();

router.post("/generate", async (req, res) => {
  const sessionId = uuidv4();
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const { name, pronouns, audioId, subliminalName, userEmail } =
    req.body as GenerateAudioRequest;

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "templates",
    `${subliminalName}.txt`
  );
  const textTemplate = fs.readFileSync(filePath, "utf-8");

  const replacedText = textTemplate.replace(/\$\{name\}/g, name);

  const ttsPath = await generateTTS(
    replacedText,
    `${sessionId}-${name}-tts.mp3`
  );

  const baseAudioPath = path.join(
    __dirname,
    "..",
    "..",
    "temp",
    `${sessionId}-${audioId}-base.mp3`
  );

  const mergedPath = path.join(
    __dirname,
    "..",
    "..",
    "temp",
    `${sessionId}-${name}-merged.mp3`
  );

  try {
    // Download audio from S3
    const s3Audio = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET!,
        Key: `base/${audioId}.mp3`,
      })
      .promise();

    fs.writeFileSync(baseAudioPath, s3Audio.Body as Buffer);

    const url = await mergeAudioFiles(baseAudioPath, ttsPath, mergedPath);
    console.log("url", url);
    cleanTempFilesBySessionId(sessionId);
    await sendAudioEmail(userEmail, url);

    res.status(200).json({ message: "You will recive the mail shortly" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Audio processing failed" });
  }
});

export default router;
