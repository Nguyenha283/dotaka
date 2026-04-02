import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// --- Helper to upload base64 image to KIE.AI file storage ---
async function uploadToKie(base64Data: string, apiKey: string): Promise<string> {
  try {
    // KIE.AI accepts the full data URL (with or without prefix)
    const response = await axios.post(
      "https://kieai.redpandaai.co/api/file-base64-upload",
      { base64Data, uploadPath: "images/base64", fileName: `image_${Date.now()}.png` },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const fileUrl = response.data?.data?.fileUrl || response.data?.fileUrl || response.data?.data?.url;
    if (!fileUrl) {
      console.error("KIE upload unexpected response:", response.data);
      throw new Error("KIE upload returned no URL");
    }
    console.log("Uploaded image to KIE storage:", fileUrl);
    return fileUrl;
  } catch (error: any) {
    console.error("KIE.AI file upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload image to KIE.AI storage");
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

    // 2. Upload images to KIE.AI storage to get URLs
    const roomUrl = await uploadToKie(roomImage, KIE_API_KEY);
    const moldingUrls = await Promise.all(moldingImages.map((img: string) => uploadToKie(img, KIE_API_KEY)));

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
