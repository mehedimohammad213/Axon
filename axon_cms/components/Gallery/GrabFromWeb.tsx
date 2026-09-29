import React, { useState } from "react";
import { Input, Button, message, Image, Modal } from "antd";
import { DownloadOutlined, CheckOutlined } from "@ant-design/icons";

const GrabFromWeb = ({ onUploadSuccess, addMediaToDB }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleGrabAndPreview = async () => {
    if (!imageUrl) {
      message.warning("Please enter a remote image URL!");
      return;
    }

    try {
      setIsLoading(true);

      // 1) Read the token from localStorage in the browser
      const token = localStorage.getItem("token");

      // 2) Fetch the image for preview
      const response = await fetch("/api/fetchAndPreview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          token,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPreviewImage(result.previewUrl);
        setIsModalVisible(true);
      } else {
        throw new Error(result.error || "Failed to fetch image");
      }
    } catch (error) {
      console.error("Preview error:", error);
      message.error(
        "Failed to fetch the image. Please check the URL and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getOrganizationId = () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization"));
      return organization?.id || null;
    } catch {
      return null;
    }
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const organizationId = getOrganizationId();

      if (!organizationId) {
        message.error("Select an organization before uploading.");
        return;
      }

      const response = await fetch("/api/fetchAndUpload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          token,
          organizationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      const uploadedMedia = result.media || result.data || [];
      message.success("Successfully grabbed and uploaded!");
      onUploadSuccess?.(uploadedMedia);
      addMediaToDB?.(uploadedMedia);

      setImageUrl("");
      setPreviewImage(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload the image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setPreviewImage(null);
  };

  return (
    <div style={{ padding: "16px", background: "#fff" }}>
      <Input
        placeholder="Paste a public image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ marginBottom: 8 }}
        onPressEnter={handleGrabAndPreview}
      />
      <Button
        type="primary"
        loading={isLoading}
        onClick={handleGrabAndPreview}
        icon={<DownloadOutlined />}
        className="headlessbutton headlessbutton-pill"
      >
        Preview Image
      </Button>

      <Modal
        title="Preview Image"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="upload"
            type="primary"
            loading={isLoading}
            onClick={handleUpload}
            icon={<CheckOutlined />}
            className="headlessbutton headlessbutton-pill"
          >
            Upload Image
          </Button>,
        ]}
      >
        {previewImage && (
          <div style={{ textAlign: "center" }}>
            <Image
              src={previewImage}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GrabFromWeb;
