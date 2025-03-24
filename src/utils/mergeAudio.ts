import ffmpeg from "fluent-ffmpeg";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";

export function mergeAudioFiles(
  file1: string,
  file2: string,
  outputFile: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(file1)
      .input(file2)
      .inputOptions("-stream_loop", "-1")
      .complexFilter(["[0:a][1:a]amerge=inputs=2[a]"])
      .outputOptions("-map", "[a]", "-shortest")
      .audioCodec("libmp3lame")
      .save(outputFile)
      .on("end", async () => {
        const s3 = new AWS.S3({
          region: process.env.AWS_REGION,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        const fileContent = fs.readFileSync(outputFile);
        const key = `output/${path.basename(outputFile)}`;

        await s3
          .upload({
            Bucket: process.env.RESULTS_S3_BUCKET!,
            Key: key,
            Body: fileContent,
            ContentType: "audio/mpeg",
          })
          .promise();

        const downloadUrl = s3.getSignedUrl("getObject", {
          Bucket: process.env.RESULTS_S3_BUCKET!,
          Key: key,
          Expires: 60 * 60 * 24 * 7, // Link valid for 7 days
        });

        console.log("✅ Uploaded to S3:", downloadUrl);

        return resolve(downloadUrl);
      })
      .on("error", (err) => reject(err));
  });
}
