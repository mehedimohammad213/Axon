import FormData from "form-data";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { imageUrl, token, organizationId } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "No imageUrl provided" });
    }

    const remoteResponse = await fetch(imageUrl);
    if (!remoteResponse.ok) {
      throw new Error(
        `Could not fetch remote URL. Status: ${remoteResponse.status}`
      );
    }

    const contentType =
      remoteResponse.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await remoteResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let filename = "remote.jpg";
    try {
      const pathname = decodeURIComponent(new URL(imageUrl).pathname);
      const basename = pathname.split("/").filter(Boolean).pop();
      if (basename) filename = basename;
    } catch {
      // keep default filename
    }

    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename,
      contentType,
    });

    const headers = {
      ...formData.getHeaders(),
      Authorization: `Bearer ${token}`,
    };
    if (organizationId) {
      headers["X-Organization-Id"] = String(organizationId);
    }

    const uploadResponse = await axios.post(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/media/upload",
      formData,
      { headers }
    );

    return res.status(200).json(uploadResponse.data);
  } catch (error) {
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    console.error("fetchAndUpload error:", backendMessage);
    return res.status(error.response?.status || 500).json({
      error: backendMessage,
    });
  }
}
