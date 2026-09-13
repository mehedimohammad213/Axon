import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Image,
  Space,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Rate,
  ColorPicker,
} from "antd";
import { FileOutlined, PictureOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import ProductLocationField from "./ProductLocationField";
import ProductRichTextField from "./ProductRichTextField";

const { TextArea } = Input;

const toMediaList = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
};

const DynamicProductFields = ({
  fields = [],
  mediaByField = {},
  onOpenMediaPicker,
}) => {
  if (!fields.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        This product type has no custom fields yet. Add fields in the builder.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {fields.map((field) => {
        const namePath = ["field_values", field.name];
        const label = field.label || field.name;
        const commonProps = {
          key: field.id || field.name,
          name: namePath,
          label,
          rules: field.required
            ? [
                {
                  required: true,
                  message: `${label} is required`,
                },
              ]
            : undefined,
        };

        if (field.field_type === "textarea") {
          return (
            <Form.Item {...commonProps}>
              <TextArea
                rows={4}
                placeholder={field.placeholder || `Enter ${label}`}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "richtext") {
          return (
            <Form.Item {...commonProps}>
              <ProductRichTextField />
            </Form.Item>
          );
        }

        if (field.field_type === "number") {
          return (
            <Form.Item {...commonProps}>
              <InputNumber
                className="w-full"
                placeholder={field.placeholder || `Enter ${label}`}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "quantity") {
          return (
            <Form.Item {...commonProps}>
              <InputNumber
                className="w-full"
                min={field.min ?? 0}
                max={field.max ?? 9999}
                step={field.step ?? 1}
                placeholder={field.placeholder || "0"}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "price") {
          return (
            <Form.Item
              {...commonProps}
              getValueProps={(value) => ({
                value:
                  value && typeof value === "object" ? value.amount : value,
              })}
            >
              <InputNumber
                className="w-full"
                min={0}
                addonBefore={field.currency || "BDT"}
                placeholder={field.placeholder || "0.00"}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "select") {
          return (
            <Form.Item {...commonProps}>
              <Select
                allowClear
                placeholder={field.placeholder || `Select ${label}`}
                options={(field.options || []).map((option) => ({
                  label: option.label || option.title || option.value,
                  value: option.value,
                }))}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "multiselect") {
          return (
            <Form.Item {...commonProps}>
              <Select
                mode="multiple"
                allowClear
                placeholder={field.placeholder || `Select ${label}`}
                options={(field.options || []).map((option) => ({
                  label: option.label || option.title || option.value,
                  value: option.value,
                }))}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "radio") {
          return (
            <Form.Item {...commonProps}>
              <Radio.Group
                options={(field.options || []).map((option) => ({
                  label: option.label || option.title || option.value,
                  value: option.value,
                }))}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "checkbox") {
          return (
            <Form.Item
              key={field.id || field.name}
              name={namePath}
              valuePropName="checked"
              rules={
                field.required
                  ? [
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error(`${label} is required`)),
                      },
                    ]
                  : undefined
              }
            >
              <Checkbox>{label}</Checkbox>
            </Form.Item>
          );
        }

        if (field.field_type === "toggle") {
          return (
            <Form.Item {...commonProps} valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
          );
        }

        if (field.field_type === "date") {
          return (
            <Form.Item
              {...commonProps}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : null,
              })}
              getValueFromEvent={(value) =>
                value ? value.format("YYYY-MM-DD") : null
              }
            >
              <DatePicker className="w-full" />
            </Form.Item>
          );
        }

        if (field.field_type === "range") {
          return (
            <Form.Item {...commonProps}>
              <Slider
                min={field.min ?? 0}
                max={field.max ?? 100}
                step={field.step ?? 1}
              />
            </Form.Item>
          );
        }

        if (field.field_type === "rating") {
          return (
            <Form.Item {...commonProps}>
              <Rate count={field.max_rating || 5} />
            </Form.Item>
          );
        }

        if (field.field_type === "color") {
          return (
            <Form.Item
              {...commonProps}
              getValueFromEvent={(color) => {
                if (!color) return null;
                if (typeof color === "string") return color;
                return color.toHexString?.() || color.toRgbString?.() || null;
              }}
            >
              <ColorPicker showText />
            </Form.Item>
          );
        }

        if (field.field_type === "location") {
          return (
            <Form.Item {...commonProps}>
              <ProductLocationField
                divisionLabel={field.division_label || "Select Division"}
                districtLabel={field.district_label || "Select District"}
              />
            </Form.Item>
          );
        }

        if (
          field.field_type === "media" ||
          field.field_type === "file" ||
          field.field_type === "gallery"
        ) {
          const stored = mediaByField[field.name];
          const items =
            field.field_type === "gallery"
              ? toMediaList(stored)
              : toMediaList(stored).slice(0, 1);
          const isGallery = field.field_type === "gallery";
          const isFile = field.field_type === "file";

          return (
            <Form.Item {...commonProps}>
              <Space direction="vertical" className="w-full">
                <div className="flex flex-wrap gap-2">
                  {items.map((media) =>
                    media?.file_path && !isFile ? (
                      <Image
                        key={media.id || media.file_path}
                        src={resolveMediaUrl(media.file_path)}
                        alt={label}
                        width={120}
                        height={90}
                        className="rounded-lg object-cover"
                        preview
                      />
                    ) : (
                      <div
                        key={media.id || media.file_path}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600"
                      >
                        {media.file_name || media.file_path || `Media #${media.id}`}
                      </div>
                    )
                  )}
                </div>
                <Button
                  icon={isFile ? <FileOutlined /> : <PictureOutlined />}
                  onClick={() =>
                    onOpenMediaPicker?.(
                      field.name,
                      isGallery ? "multiple" : "single"
                    )
                  }
                >
                  {items.length
                    ? isGallery
                      ? "Change gallery"
                      : isFile
                        ? "Change file"
                        : "Change media"
                    : isGallery
                      ? "Select gallery"
                      : isFile
                        ? "Select file"
                        : "Select media"}
                </Button>
              </Space>
            </Form.Item>
          );
        }

        const inputType =
          field.field_type === "email"
            ? "email"
            : field.field_type === "url"
              ? "url"
              : field.field_type === "phone"
                ? "tel"
                : "text";

        return (
          <Form.Item {...commonProps}>
            <Input
              type={inputType}
              placeholder={field.placeholder || `Enter ${label}`}
            />
          </Form.Item>
        );
      })}
    </div>
  );
};

export default DynamicProductFields;
