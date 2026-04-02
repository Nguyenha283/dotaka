import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

import FormData from "form-data";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- Helper to convert base64 to temporary URL ---
async function uploadToTmp(base64Data: string): Promise<string> {
  try {
    const base64Content = base64Data.split(",")[1];
    const buffer = Buffer.from(base64Content, "base64");
    
    const form = new FormData();
    form.append("file", buffer, { filename: "image.png", contentType: "image/png" });

    const response = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // tmpfiles.org returns a URL like https://tmpfiles.org/123/image.png
    // Direct link is https://tmpfiles.org/dl/123/image.png
    const directUrl = response.data.data.url.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
    console.log("Uploaded image to:", directUrl);
    return directUrl;
  } catch (error: any) {
    console.error("Upload to tmpfiles.org failed:", error.response?.data || error.message);
    throw new Error("Failed to upload image to temporary storage");
  }
}

// --- KIE.AI API Proxy ---

const KIE_API_URL = "https://api.kie.ai/api/v1/jobs";
const KIE_API_KEY = process.env.KIE_API_KEY || "8b1ae19ee0929b49008edf94dafb85da";

if (!process.env.KIE_API_KEY) {
  console.warn("Warning: KIE_API_KEY is not set in environment variables. Using default key.");
} else {
  console.log("KIE_API_KEY is set from environment.");
}

app.post("/api/generate", async (req, res) => {
  try {
    const { roomImage, moldingImages, prompt, aspectRatio, resolution } = req.body;

    // 1. Validate inputs
    if (!roomImage) throw new Error("Missing room image");
    if (!moldingImages || !Array.isArray(moldingImages) || moldingImages.length === 0) {
      throw new Error("Missing molding images");
    }

    console.log("Starting generation for task...");

    // 2. Upload images to temporary storage to get URLs
    const roomUrl = await uploadToTmp(roomImage);
    const moldingUrls = await Promise.all(moldingImages.map((img: string) => uploadToTmp(img)));

    // 3. Combine into input_urls
    const input_urls = [roomUrl, ...moldingUrls].filter(url => !!url);

    if (input_urls.length < 2) {
      throw new Error("Failed to process images. At least 2 images are required.");
    }

    // 4. Construct payload for KIE.AI (Matching your standard body exactly)
    const sanitizedPrompt = (prompt || "Professional interior renovation, add ceiling molding, realistic, 8k")
      .replace(/\s+/g, ' ')
      .trim();

    const payload = {
      model: "flux-2/pro-image-to-image",
      input_urls: input_urls,
      prompt: sanitizedPrompt,
      aspect_ratio: aspectRatio || "16:9",
      resolution: resolution || "1K",
      nsfw_checker: true
    };

    console.log("KIE API Request URL:", `${KIE_API_URL}/createTask`);
    console.log("KIE API Request Headers:", {
      "Content-Type": "application/json",
      "x-api-key": KIE_API_KEY.substring(0, 4) + "..."
    });
    console.log("KIE API Request Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(`${KIE_API_URL}/createTask`, payload, {
      headers: {
        "Authorization": `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json"
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data.code !== 0) {
      console.error("KIE API Error Response:", response.data);
      return res.status(400).json({ 
        error: response.data.message || "Failed to create task",
        details: response.data 
      });
    }

    const taskId = response.data.data?.task_id;
    if (!taskId) {
      console.error("KIE API Success but no task_id:", response.data);
      return res.status(500).json({ error: "API returned success but no task ID" });
    }
    console.log("Task created successfully:", taskId);
    res.json({ taskId });
  } catch (error: any) {
    console.error("KIE API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.get("/api/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const response = await axios.get(`${KIE_API_URL}/recordInfo`, {
      params: { task_id: taskId },
      headers: {
        "Authorization": `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("KIE Status Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
