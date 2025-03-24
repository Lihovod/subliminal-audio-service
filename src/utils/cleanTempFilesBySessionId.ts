import fs from "fs";
import path from "path";

export const cleanTempFilesBySessionId = (sessionId: string) => {
  const tempDir = path.join(__dirname, "..", "..", "temp");

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error("❌ Failed to read temp directory:", err);
      return;
    }

    const sessionFiles = files.filter((file) => file.startsWith(sessionId));

    sessionFiles.forEach((file) => {
      const filePath = path.join(tempDir, file);
      fs.unlink(filePath, (err) => {
        if (err) console.error(`❌ Failed to delete ${file}:`, err);
        else console.log(`🧹 Deleted temp file: ${file}`);
      });
    });
  });
};
