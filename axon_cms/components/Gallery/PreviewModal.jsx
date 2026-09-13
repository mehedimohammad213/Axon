// components/Gallery/PreviewModal.jsx

import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Drawer, Select, Tag, Space } from "antd";
import {
  CloseOutlined,
  CloudOutlined,
  CopyOutlined,
  EditOutlined,
} from "@ant-design/icons";
import instance from "../../axios";
import Image from "next/image";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const { Option } = Select;

const PreviewModal = ({
  visible,
  onClose,
  media,
  mediaType,
  handleEdit,
  availableTags, // New prop for available tags
}) => {
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Info displayed in table if not editing
  const infoRows = [
    { key: "title", label: "Title", value: media.title || media.file_name },
    {
      key: "size",
      label: "Size",
      value: media.file_size
        ? `${(media.file_size / (1024 * 1024)).toFixed(2)} MB`
        : "Size not available",
    },
    { key: "type", label: "Type", value: media.file_type },
    {
      key: "uploadDate",
      label: "Upload Date",
      value: new Date(media.created_at).toLocaleString(),
    },
    {
      key: "tags",
      label: "Tags",
      value:
        media.tags && media.tags.length > 0
          ? media.tags.map((t) => (
              <Tag color="orange" key={t}>
                {t}
              </Tag>
            ))
          : "None",
    },
  ];

  useEffect(() => {
    if (editMode) {
      form.setFieldsValue({
        title: media.title || "",
        tags: Array.isArray(media.tags) ? media.tags : [],
      });
    }
  }, [editMode, media, form]);

  useEffect(() => {
    if (!visible) {
      setEditMode(false);
    }
  }, [visible]);

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
        handleEdit(updatedMedia); // parent updates cache and IndexedDB
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

  const renderNonEditContent = () => (
    <>
      {/* Show preview differently based on mediaType */}
      {mediaType === "image" && (
        <div className="mb-4 flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-3">
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
      )}
      {mediaType === "video" && (
        <div className="mb-4 w-full overflow-hidden rounded-lg bg-black">
          <video
            className="mx-auto max-h-[420px] w-full object-contain"
            controls
          >
            <source src={mediaUrl} type={media.file_type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      {mediaType === "document" && (
        <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-200">
          <iframe
            src={mediaUrl}
            title={media.file_name || "Document preview"}
            className="h-[420px] w-full"
          />
        </div>
      )}

      <div className="my-4">
        {infoRows.map((row) => (
          <div key={row.key} className="mb-2">
            <strong>{row.label}:</strong>{" "}
            {Array.isArray(row.value) ? row.value : row.value}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          icon={<EditOutlined />}
          onClick={() => setEditMode(true)}
          className="headlessbutton"
        >
          Edit
        </Button>
        <Space wrap>
          <Button
            className="headlessbutton"
            onClick={() => {
              navigator.clipboard.writeText(`/${media.file_path}`);
              message.success("Relative Path copied to clipboard.");
            }}
            icon={<CopyOutlined />}
          >
            Copy Path
          </Button>
          <Button
            className="headlessbutton"
            onClick={() => {
              navigator.clipboard.writeText(mediaUrl);
              message.success("Full Link copied to clipboard.");
            }}
            icon={<CopyOutlined />}
          >
            Copy Link
          </Button>
        </Space>
      </div>
    </>
  );

  const renderEditForm = () => (
    <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please enter a title." }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Tags" name="tags">
        {/* mode="tags" so user can add new or pick existing from availableTags */}
        <Select
          mode="tags"
          placeholder="Enter tags"
          style={{ width: "100%" }}
          tokenSeparators={[","]}
        >
          {availableTags.map((tag) => (
            <Option key={tag} value={tag}>
              {tag}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <div className="flex justify-between">
        <Button
          type="primary"
          htmlType="submit"
          icon={<CloudOutlined />}
          loading={isSubmitting}
          className="headlessbutton"
        >
          Save
        </Button>
        <Button
          onClick={() => setEditMode(false)}
          icon={<CloseOutlined />}
          className="headlesscancelbutton"
        >
          Cancel
        </Button>
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
      title={media.title || media.file_name}
    >
      {editMode ? renderEditForm() : renderNonEditContent()}
    </Drawer>
  );
};

export default PreviewModal;
