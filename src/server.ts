import express from "express";
import dotenv from "dotenv";
import generateRoute from "./routes/generate";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", generateRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🎧 Audio service running on http://localhost:${PORT}`);
});
