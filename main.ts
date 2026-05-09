const IMAGE_DIR = "./images";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

try {
  const stat = await Deno.stat(IMAGE_DIR);
  if (!stat.isDirectory) {
    console.error(`Path "${IMAGE_DIR}" exists but is not a directory.`);
    Deno.exit(1);
  }
} catch (err) {
  if (err instanceof Deno.errors.NotFound) {
    console.error(`Directory "${IMAGE_DIR}" does not exist.`);
  } else if (err instanceof Deno.errors.PermissionDenied) {
    console.error(`Permission denied reading "${IMAGE_DIR}".`);
  } else {
    console.error(`Failed to access "${IMAGE_DIR}":`, err);
  }
  Deno.exit(1);
}

Deno.serve({ port: 8000 }, async () => {
  try {
    const files: string[] = [];
    for await (const entry of Deno.readDir(IMAGE_DIR)) {
      if (!entry.isFile) continue;
      const ext = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
      if (ext in MIME_TYPES) files.push(entry.name);
    }

    if (files.length === 0) {
      return new Response("No images found", { status: 404 });
    }

    const pick = files[Math.floor(Math.random() * files.length)];
    const ext = pick.slice(pick.lastIndexOf(".")).toLowerCase();
    const file = await Deno.open(`${IMAGE_DIR}/${pick}`, { read: true });

    return new Response(file.readable, {
      headers: {
        "content-type": MIME_TYPES[ext],
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return new Response("Image directory disappeared", { status: 503 });
    }
    console.error("Request failed:", err);
    return new Response("Internal server error", { status: 500 });
  }
});