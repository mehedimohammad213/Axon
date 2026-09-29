import React, { useRef, useState } from "react";
import { Upload, Button, message, Progress, Tag } from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios"; // Use axios directly for Cloudinary
import instance from "../../axios"; // Existing axios instance for your backend
import Image from "next/image";

const { Dragger } = Upload;

const extractUploadedMedia = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.media)) return payload.media;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.id) return [payload];
  return [];
};

const UploadMedia = ({
  onUploadSuccess,
  selectionMode = "single",
  onSelectMedia,
  uploadDestination = "backend", // New prop with default value
  addMediaToDB, // New prop for adding media to IndexedDB
}) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const pendingUploads = useRef(0);
  const uploadedMedia = useRef([]);

  const handleBeforeUpload = (file) => {
    const maxSize = 1024 * 1024 * 1024; // 1GB in bytes
    const isValidSize = file.size < maxSize;
    const isValidType = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/mkv",
      "video/mpeg",
      "video/mov",
      "video/m4u",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    ].includes(file.type);

    if (!isValidSize) {
      message.error(
        `File size must be less than 1GB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      return false;
    }

    if (!isValidType) {
      message.error(
        "Unsupported file type. Please check the allowed file types."
      );
      return false;
    }

    return true;
  };

  const handleChange = ({ file, fileList: newFileList }) => {
    // Update the fileList with progress and status
    setFileList(
      newFileList.map((f) => {
        if (f.response) {
          f.status = "done";
          f.thumbUrl = f.response.secure_url || f.response.url; // Set thumbUrl for images
        }
        return f;
      })
    );
  };

  const handleRemove = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const finishBatchIfIdle = () => {
    if (pendingUploads.current > 0 || uploadedMedia.current.length === 0) {
      return;
    }
    const batch = uploadedMedia.current;
    uploadedMedia.current = [];
    setFileList([]);
    onUploadSuccess?.(batch);
  };

  const customUpload = async ({ onSuccess, onError, file, onProgress }) => {
    const formData = new FormData();
    let response;

    pendingUploads.current += 1;
    setUploading(true);

    try {
      if (uploadDestination === "cloudinary") {
        formData.append("file", file);
        formData.append("upload_preset", "headless_cms_preset");

        response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              onProgress({ percent });
            },
          }
        );

        onSuccess(response.data, file);
        uploadedMedia.current.push(...extractUploadedMedia(response.data));
        message.success(`${file.name} uploaded successfully to Cloudinary.`);
      } else {
        formData.append("file", file);

        response = await instance.post("/media/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            onProgress({ percent });
          },
        });

        onSuccess(response.data, file);
        uploadedMedia.current.push(...extractUploadedMedia(response.data));
        message.success(`${file.name} uploaded successfully.`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError(error);
      message.error(`${file.name} upload failed.`);
    } finally {
      pendingUploads.current -= 1;
      setUploading(pendingUploads.current > 0);
      finishBatchIfIdle();
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <Dragger
        multiple={selectionMode === "multiple"}
        beforeUpload={handleBeforeUpload}
        customRequest={customUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        fileList={fileList}
        showUploadList={false}
        className="rounded-md"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined className="text-4xl text-gray-400" />
        </p>
        <p className="ant-upload-text text-lg">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint text-sm text-gray-500">
          Support for a single or bulk upload. Strictly prohibit from uploading
          company data or other banned files
        </p>
      </Dragger>
      {fileList.length > 0 && (
        <div className="mt-4">
          {fileList.map((file) => (
            <div
              key={file.uid}
              className="flex items-center justify-between p-2 mb-2 bg-gray-100 rounded-md"
            >
              <div className="flex items-center">
                {file.type.startsWith("image/") ? (
                  <Image
                    src={file.thumbUrl || "/icons/image-placeholder.svg"}
                    alt={file.name}
                    width={50}
                    height={50}
                    className="object-cover rounded-md"
                  />
                ) : file.type.startsWith("video/") ? (
                  <Image
                    src="/icons/video-placeholder.svg"
                    alt={file.name}
                    width={50}
                    height={50}
                  />
                ) : (
                  <Image
                    src="/icons/document-placeholder.svg"
                    alt={file.name}
                    width={50}
                    height={50}
                  />
                )}
                <div className="ml-4">
                  <p className="font-semibold">{file.name}</p>
                  {file.status === "uploading" && (
                    <Progress percent={file.percent} size="small" />
                  )}
                  {file.status === "done" && <Tag color="green">Uploaded</Tag>}
                  {file.status === "error" && <Tag color="red">Error</Tag>}
                </div>
              </div>
              <Button
                type="text"
                icon={<DeleteOutlined className="text-red-500" />}
                onClick={() => handleRemove(file)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadMedia;
