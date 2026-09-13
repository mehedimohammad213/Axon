import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Switch,
  Select,
  Space,
  Image,
  message,
} from "antd";
import { PictureOutlined } from "@ant-design/icons";
import instance from "../../axios";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import DynamicProductFields from "./DynamicProductFields";
import { parseFieldSchema } from "./productUtils";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const { TextArea } = Input;

const ProductFormDrawer = ({
  open,
  productTypes = [],
  editingProduct = null,
  defaultTypeId = null,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [fieldMedia, setFieldMedia] = useState({});
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [mediaTarget, setMediaTarget] = useState(null);

  const selectedType = useMemo(
    () => productTypes.find((type) => String(type.id) === String(selectedTypeId)),
    [productTypes, selectedTypeId]
  );

  const fields = useMemo(
    () => parseFieldSchema(selectedType?.field_schema),
    [selectedType]
  );

  useEffect(() => {
    if (!open) return;

    if (editingProduct) {
      const typeId = editingProduct.product_type_id;
      setSelectedTypeId(typeId);
      form.setFieldsValue({
        title: editingProduct.title || "",
        slug: editingProduct.slug || "",
        description: editingProduct.description || "",
        product_type_id: typeId,
        status: editingProduct.status !== false,
        field_values: editingProduct.field_values || {},
      });
      setSelectedMedia(editingProduct.media || []);
      const nextFieldMedia = {};
      const fieldValues = editingProduct.field_values || {};
      parseFieldSchema(editingProduct.product_type?.field_schema).forEach(
        (field) => {
          if (
            ["media", "file", "gallery"].includes(field.field_type) &&
            fieldValues[field.name]
          ) {
            nextFieldMedia[field.name] = fieldValues[field.name];
          }
        }
      );
      setFieldMedia(nextFieldMedia);
    } else {
      const typeId = defaultTypeId || productTypes[0]?.id || null;
      setSelectedTypeId(typeId);
      form.setFieldsValue({
        title: "",
        slug: "",
        description: "",
        product_type_id: typeId,
        status: true,
        field_values: {},
      });
      setSelectedMedia([]);
      setFieldMedia({});
    }
  }, [open, editingProduct, defaultTypeId, productTypes, form]);

  const openMediaPicker = (target, mode = "single") => {
    setMediaTarget({ key: target, mode });
    setIsMediaModalVisible(true);
  };

  const handleMediaSelect = (mediaItem) => {
    const items = Array.isArray(mediaItem) ? mediaItem : [mediaItem];
    const targetKey = mediaTarget?.key;
    const mode = mediaTarget?.mode || "single";

    if (targetKey === "gallery") {
      setSelectedMedia(items.filter(Boolean));
    } else if (targetKey) {
      const value =
        mode === "multiple"
          ? items.filter(Boolean).map((media) => ({
              id: media.id,
              file_path: media.file_path,
              file_type: media.file_type,
              file_name: media.file_name,
            }))
          : items[0]
            ? {
                id: items[0].id,
                file_path: items[0].file_path,
                file_type: items[0].file_type,
                file_name: items[0].file_name,
              }
            : null;

      setFieldMedia((prev) => ({ ...prev, [targetKey]: value }));
      form.setFieldsValue({
        field_values: {
          ...(form.getFieldValue("field_values") || {}),
          [targetKey]: value,
        },
      });
    }
    setIsMediaModalVisible(false);
    setMediaTarget(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!values.product_type_id) {
        message.error("Select a product type first.");
        return;
      }

      const payload = {
        title: values.title.trim(),
        slug: values.slug?.trim() || undefined,
        description: values.description || null,
        product_type_id: values.product_type_id,
        status: values.status !== false,
        field_values: values.field_values || {},
        media_ids: selectedMedia.map((item) => item.id).filter(Boolean),
      };

      setSubmitting(true);
      const response = editingProduct?.id
        ? await instance.put(`/products/${editingProduct.id}`, payload)
        : await instance.post("/products", payload);

      message.success(
        editingProduct?.id
          ? "Product updated successfully."
          : "Product uploaded successfully."
      );
      onSuccess?.(response.data);
      onClose?.();
    } catch (error) {
      if (error?.errorFields) {
        message.error("Please fix the errors in the form.");
        return;
      }
      message.error(
        error?.response?.data?.message ||
          (editingProduct?.id
            ? "Failed to update product."
            : "Failed to upload product.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Drawer
        title={editingProduct?.id ? "Edit Product" : "Upload Product"}
        placement="right"
        width={560}
        open={open}
        onClose={onClose}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={handleSubmit}
              className="bg-brand"
            >
              {editingProduct?.id ? "Save Product" : "Upload Product"}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Product type"
            name="product_type_id"
            rules={[{ required: true, message: "Product type is required" }]}
          >
            <Select
              placeholder="Select product type / form"
              options={productTypes.map((type) => ({
                label: type.name,
                value: type.id,
              }))}
              onChange={(value) => {
                setSelectedTypeId(value);
                form.setFieldsValue({ field_values: {} });
                setFieldMedia({});
              }}
              disabled={Boolean(editingProduct?.id)}
            />
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Product title" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="optional-slug" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Short product description" />
          </Form.Item>

          <Form.Item label="Product images">
            <Space direction="vertical" className="w-full">
              <div className="flex flex-wrap gap-2">
                {selectedMedia.map((media) => (
                  <Image
                    key={media.id}
                    src={resolveMediaUrl(media.file_path)}
                    alt={media.file_name || "Product media"}
                    width={88}
                    height={66}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
              <Button
                icon={<PictureOutlined />}
                onClick={() => openMediaPicker("gallery")}
              >
                {selectedMedia.length ? "Change images" : "Select images"}
              </Button>
            </Space>
          </Form.Item>

          <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Custom fields for{" "}
            <strong>{selectedType?.name || "selected type"}</strong>
          </div>

          <DynamicProductFields
            fields={fields}
            mediaByField={fieldMedia}
            onOpenMediaPicker={openMediaPicker}
          />

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Drawer>

      <MediaSelectionModal
        isVisible={isMediaModalVisible}
        onClose={() => {
          setIsMediaModalVisible(false);
          setMediaTarget(null);
        }}
        onSelectMedia={handleMediaSelect}
        selectionMode={
          mediaTarget?.key === "gallery" || mediaTarget?.mode === "multiple"
            ? "multiple"
            : "single"
        }
        initialSelectedMedia={
          mediaTarget?.key === "gallery"
            ? selectedMedia
            : Array.isArray(fieldMedia[mediaTarget?.key])
              ? fieldMedia[mediaTarget?.key]
              : fieldMedia[mediaTarget?.key]
                ? [fieldMedia[mediaTarget?.key]]
                : []
        }
      />
    </>
  );
};

export default ProductFormDrawer;
