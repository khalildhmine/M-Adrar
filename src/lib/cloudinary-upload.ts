/**
 * Get an upload signature from the API and upload a file to Cloudinary.
 * Returns the secure URL of the uploaded image, or throws on error.
 */
type UploadImageOptions = {
  folder?: string;
  timeoutMs?: number;
  retries?: number;
};

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const timeoutMs = init.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { timeoutMs: _t, ...rest } = init;
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<Blob> {
  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1600;
  const quality = options.quality ?? 0.8;

  // If already reasonably small, don't bother compressing.
  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
      image.src = imageUrl;
    });

    let { width, height } = img;
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Image compression failed"));
          resolve(b);
        },
        "image/jpeg",
        quality,
      );
    });

    return blob;
  } catch {
    // On any error, fall back to original file
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function uploadImage(file: File, apiBase: string, options: UploadImageOptions = {}): Promise<string> {
  const folder = options.folder ?? "maison-adrar";
  const timeoutMs = options.timeoutMs ?? 45_000;
  const retries = options.retries ?? 0; // fail fast by default

  // Cloudinary hard limits depend on plan; this is just a UX guardrail
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("Image too large (max ~25MB). Please choose a smaller file.");
  }

  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const uploadFile = await compressImage(file);

      const sigRes = await fetchWithTimeout(`${apiBase}/v1/uploads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
        timeoutMs: Math.min(timeoutMs, 30_000),
      });
      if (!sigRes.ok) {
        const err = (await sigRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Failed to get upload signature");
      }

      const sig = (await sigRes.json()) as {
        upload_url: string;
        api_key: string;
        timestamp: number;
        signature: string;
        folder: string;
      };

      const form = new FormData();
      form.append("file", uploadFile);
      form.append("api_key", sig.api_key);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      if (sig.folder) form.append("folder", sig.folder);

      const uploadRes = await fetchWithTimeout(sig.upload_url, {
        method: "POST",
        body: form,
        timeoutMs,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text().catch(() => "");
        throw new Error(text || "Upload failed");
      }

      const result = (await uploadRes.json()) as { secure_url?: string; url?: string };
      const url = result.secure_url ?? result.url;
      if (!url) throw new Error("No URL in upload response");
      return url;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : "Network error while uploading image";

      const isAbort = e instanceof DOMException && e.name === "AbortError";

      // Retry only on timeouts / network errors. Signature failures should fail fast.
      const shouldRetry =
        attempt < retries && (isAbort || /timed? out/i.test(msg) || /network/i.test(msg) || /fetch/i.test(msg));

      if (!shouldRetry) {
        throw new Error(
          isAbort
            ? "Upload timed out. Please check your connection or use a smaller image."
            : msg || "Upload failed. Please check your connection and retry.",
        );
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms...
      await sleep(500 * 2 ** attempt);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Upload failed. Please try again.");
}
