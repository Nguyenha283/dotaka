import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const KIE_API_KEY = process.env.KIE_API_KEY || "8b1ae19ee0929b49008edf94dafb85da";

if (!process.env.KIE_API_KEY) {
  console.warn("⚠️  Warning: KIE_API_KEY not set in .env — using default key.");
} else {
  console.log("✅ KIE_API_KEY loaded from environment.");
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ─────────────────────────────────────────────
// Helper: Upload base64 image → KIE.AI storage → returns public URL
// Docs: https://docs.kie.ai/file-upload-api/upload-file-base-64
// Endpoint: POST https://kieai.redpandaai.co/api/file-base64-upload
// Body: { base64Data, uploadPath, fileName }
// Response: { success, code, data: { downloadUrl } }
// ─────────────────────────────────────────────
async function uploadImageToKie(base64Data: string): Promise<string> {
  const response = await axios.post(
    "https://kieai.redpandaai.co/api/file-base64-upload",
    {
      base64Data,                      // full data-URL: "data:image/png;base64,..."
      uploadPath: "images/base64",
      fileName: `img_${Date.now()}.png`,
    },
    {
      headers: {
        Authorization: `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000,
    }
  );

  // Expected: { success: true, code: 200, data: { downloadUrl: "https://..." } }
  if (!response.data?.success || response.data?.code !== 200) {
    console.error("❌ KIE upload failed:", JSON.stringify(response.data));
    throw new Error(`KIE upload error: ${response.data?.msg || "unknown"}`);
  }

  // downloadUrl is the publicly accessible URL
  const url = response.data?.data?.downloadUrl || response.data?.data?.fileUrl;
  if (!url) {
    console.error("❌ KIE upload no URL:", JSON.stringify(response.data));
    throw new Error("KIE upload returned no URL");
  }

  console.log("✅ Uploaded:", url);
  return url;
}

// ─────────────────────────────────────────────
// POST /api/generate  →  create KIE task, return taskId
// ─────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  try {
    const { roomImage, moldingImages, prompt, aspectRatio, resolution } = req.body;

    if (!roomImage) throw new Error("Missing room image");
    if (!moldingImages || !Array.isArray(moldingImages) || moldingImages.length === 0) {
      throw new Error("Missing molding images");
    }

    console.log("🚀 Starting generation…");

    // 1. Upload all images to KIE storage
    const [roomUrl, ...moldingUrls] = await Promise.all([
      uploadImageToKie(roomImage),
      ...moldingImages.map((img: string) => uploadImageToKie(img)),
    ]);

    const input_urls = [roomUrl, ...moldingUrls];
    console.log("📎 input_urls:", input_urls);

    // 2. Build prompt
    const sanitizedPrompt = (
      prompt || "Professional interior renovation, add ceiling molding, realistic, 8k"
    )
      .replace(/\s+/g, " ")
      .trim();

    // 3. Call KIE createTask
    // Model: flux-2/flex-image-to-image
    // Docs: https://docs.kie.ai/market/flux2/flex-image-to-image
    const payload = {
      model: "flux-2/flex-image-to-image",
      input: {
        input_urls,
        prompt: sanitizedPrompt,
        aspect_ratio: aspectRatio || "16:9",
        resolution: resolution || "1K",
        nsfw_checker: false,
      },
    };

    console.log("📤 KIE payload:", JSON.stringify(payload, null, 2));

    const kieRes = await axios.post(
      "https://api.kie.ai/api/v1/jobs/createTask",
      payload,
      {
        headers: {
          Authorization: `Bearer ${KIE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("📥 KIE createTask response:", JSON.stringify(kieRes.data));

    // KIE success: { code: 200, msg: "success", data: { taskId: "..." } }
    if (kieRes.data?.code !== 200) {
      return res.status(400).json({
        error: kieRes.data?.msg || "KIE API returned non-200 code",
        details: kieRes.data,
      });
    }

    const taskId = kieRes.data?.data?.taskId;
    if (!taskId) {
      return res.status(500).json({ error: "KIE returned success but no taskId" });
    }

    console.log("✅ Task created:", taskId);
    res.json({ taskId });
  } catch (error: any) {
    const detail = error.response?.data || error.message;
    console.error("❌ /api/generate error:", detail);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/task/:taskId  →  poll task status
// ─────────────────────────────────────────────
app.get("/api/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const kieRes = await axios.get("https://api.kie.ai/api/v1/jobs/recordInfo", {
      params: { taskId },
      headers: {
        Authorization: `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("📥 KIE recordInfo:", JSON.stringify(kieRes.data));
    res.json(kieRes.data);
  } catch (error: any) {
    const detail = error.response?.data || error.message;
    console.error("❌ /api/task error:", detail);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─────────────────────────────────────────────
// Vite middleware (dev) / static (prod)
// ─────────────────────────────────────────────
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`\n🌐 Server running → http://localhost:${PORT}\n`);
  });
}

startServer();
