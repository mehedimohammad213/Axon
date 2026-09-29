// components/Gallery/PreviewModal.jsx

import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Drawer, Select, Tag } from "antd";
import { CloudOutlined, CopyOutlined } from "@ant-design/icons";
import instance from "../../axios";
import Image from "next/image";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const { Option } = Select;

const InfoRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-800">
      {children}
    </dd>
  </div>
);

const PreviewModal = ({
  visible,
  onClose,
  media,
  mediaType,
  handleEdit,
  initialEditMode = false,
  availableTags,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMode) {
      form.setFieldsValue({
        title: media.title || "",
        tags: Array.isArray(media.tags) ? media.tags : [],
      });
    }
  }, [editMode, media, form]);

  useEffect(() => {
    if (visible) {
      setEditMode(!!initialEditMode);
    } else {
      setEditMode(false);
    }
  }, [visible, initialEditMode]);

  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const updatedMedia = {
        ...media,
        title: values.title,
        tags: Array.isArray(values.tags) ? values.tags : [],
        updated_at: new Date().toISOString(),
      };
      const response = await instance.put(`/media/${media.id}`, updatedMedia);
      if (response.status === 200) {
        message.success("Media updated successfully.");
        handleEdit(updatedMedia);
        setEditMode(false);
        onClose();
      } else {
        message.error("Failed to update media.");
      }
    } catch (error) {
      console.error("Error updating media:", error);
      message.error("An error occurred while updating the media.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSvgImage =
    media?.file_type === "image/svg+xml" ||
    media?.file_name?.toLowerCase().endsWith(".svg");

  const mediaUrl = resolveMediaUrl(media.file_path);

  const renderPreview = () => {
    if (mediaType === "image") {
      return (
        <div className="flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-3">
          {isSvgImage ? (
            <img
              src={mediaUrl}
              alt={media.file_name}
              className="mx-auto max-h-[420px] max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <Image
              src={mediaUrl}
              alt={media.file_name}
              width={1200}
              height={675}
              className="mx-auto !h-auto max-h-[420px] w-full object-contain"
              style={{ objectFit: "contain", width: "100%", height: "auto" }}
              unoptimized
            />
          )}
        </div>
      );
    }
    if (mediaType === "video") {
      return (
        <div className="w-full overflow-hidden rounded-lg bg-black">
          <video
            className="mx-auto max-h-[420px] w-full object-contain"
            controls
          >
            <source src={mediaUrl} type={media.file_type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <iframe
          src={mediaUrl}
          title={media.file_name || "Document preview"}
          className="h-[420px] w-full"
        />
      </div>
    );
  };

  const renderNonEditContent = () => (
    <div className="space-y-4">
      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          background: "#ffffff",
        }}
      >
        {renderPreview()}
      </div>

      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          background: "#ffffff",
        }}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoRow label="Title">{media.title || media.file_name}</InfoRow>
          <InfoRow label="Size">
            {media.file_size
              ? `${(media.file_size / (1024 * 1024)).toFixed(2)} MB`
              : "Size not available"}
          </InfoRow>
          <InfoRow label="Type">{media.file_type}</InfoRow>
          <InfoRow label="Upload Date">
            {new Date(media.created_at).toLocaleString()}
          </InfoRow>
          <InfoRow label="Tags">
            {media.tags && media.tags.length > 0
              ? media.tags.map((t) => (
                  <Tag color="orange" key={t}>
                    {t}
                  </Tag>
                ))
              : "None"}
          </InfoRow>
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          className="headlessbutton headlessbutton-pill"
          onClick={() => {
            navigator.clipboard.writeText(`/${media.file_path}`);
            message.success("Relative Path copied to clipboard.");
          }}
          icon={<CopyOutlined />}
        >
          Copy Path
        </Button>
        <Button
          className="headlessbutton headlessbutton-pill"
          onClick={() => {
            navigator.clipboard.writeText(mediaUrl);
            message.success("Full Link copied to clipboard.");
          }}
          icon={<CopyOutlined />}
        >
          Copy Link
        </Button>
      </div>
    </div>
  );

  const renderEditForm = () => (
    <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#ffffff",
        }}
      >
        {renderPreview()}
      </div>
      <div
        style={{
          border: "1px solid #e8eef5",
          borderRadius: 12,
          padding: 16,
          background: "#ffffff",
        }}
      >
        <div className="grid gap-x-4 md:grid-cols-2">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title." }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Tags" name="tags">
            <Select
              mode="tags"
              placeholder="Enter tags"
              style={{ width: "100%" }}
              tokenSeparators={[","]}
            >
              {(availableTags || []).map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>
    </Form>
  );

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      placement="right"
      width="50%"
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      title={media.title || media.file_name}
      footer={
        editMode ? (
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<CloudOutlined />}
              loading={isSubmitting}
              onClick={() => form.submit()}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update Media
            </Button>
          </div>
        ) : null
      }
    >
      {editMode ? renderEditForm() : renderNonEditContent()}
    </Drawer>
  );
};

export default PreviewModal;
