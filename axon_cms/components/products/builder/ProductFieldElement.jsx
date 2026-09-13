import React, { useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Rate,
  Select,
  Slider,
  Switch,
  Upload,
  ColorPicker,
} from "antd";
import { useDrag, useDrop } from "react-dnd";
import ProductFieldConfig from "./ProductFieldConfig";
import LocationFetcher from "../../formbuilder/LocationFetcher";

const ProductFieldElement = ({
  field,
  index,
  moveField = () => {},
  onUpdateField = () => {},
  isPreview = false,
}) => {
  const ref = useRef(null);
  const [configVisible, setConfigVisible] = useState(false);

  const [{ isDragging }, dragRef] = useDrag({
    type: "productCanvasField",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isPreview,
  });

  const [, dropRef] = useDrop({
    accept: "productCanvasField",
    hover: (draggedItem) => {
      if (isPreview || !ref.current) return;
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveField(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    canDrop: () => !isPreview,
  });

  dragRef(dropRef(ref));

  const optionList = (field.options || []).map((option) => ({
    label: option.label || option.title || option.value,
    value: option.value,
  }));

  const renderPreview = () => {
    switch (field.field_type) {
      case "textarea":
        return (
          <Input.TextArea
            disabled
            rows={3}
            placeholder={field.placeholder || field.label}
          />
        );
      case "richtext":
        return (
          <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
            Rich text editor preview
          </div>
        );
      case "select":
        return (
          <Select
            disabled
            className="w-full"
            placeholder={field.placeholder || field.label}
            options={optionList}
          />
        );
      case "multiselect":
        return (
          <Select
            disabled
            mode="multiple"
            className="w-full"
            placeholder={field.placeholder || field.label}
            options={optionList}
          />
        );
      case "radio":
        return (
          <Radio.Group disabled options={optionList} />
        );
      case "checkbox":
        return <Checkbox disabled>{field.label || "Yes"}</Checkbox>;
      case "toggle":
        return (
          <Switch
            disabled
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        );
      case "price":
        return (
          <InputNumber
            disabled
            className="w-full"
            addonBefore={field.currency || "BDT"}
            placeholder={field.placeholder || "0.00"}
          />
        );
      case "quantity":
        return (
          <InputNumber
            disabled
            className="w-full"
            min={field.min ?? 0}
            max={field.max ?? 9999}
            placeholder={field.placeholder || "0"}
          />
        );
      case "range":
        return (
          <Slider
            disabled
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            defaultValue={field.min ?? 0}
          />
        );
      case "rating":
        return <Rate disabled count={field.max_rating || 5} />;
      case "color":
        return <ColorPicker disabled defaultValue="#1677ff" />;
      case "sku":
        return (
          <Input
            disabled
            placeholder={field.placeholder || "SKU / barcode"}
          />
        );
      case "location":
        return (
          <LocationFetcher
            divisionLabel={field.division_label || "Select Division"}
            districtLabel={field.district_label || "Select District"}
          />
        );
      case "media":
        return (
          <Upload disabled>
            <Button>Select Media (Preview)</Button>
          </Upload>
        );
      case "file":
        return (
          <Upload disabled>
            <Button>Upload File (Preview)</Button>
          </Upload>
        );
      case "gallery":
        return (
          <Upload disabled listType="picture-card">
            Gallery Preview
          </Upload>
        );
      case "number":
        return (
          <Input
            disabled
            type="number"
            placeholder={field.placeholder || field.label}
          />
        );
      case "date":
        return (
          <Input
            disabled
            type="date"
            placeholder={field.placeholder || field.label}
          />
        );
      case "email":
        return (
          <Input
            disabled
            type="email"
            placeholder={field.placeholder || field.label}
          />
        );
      case "url":
        return (
          <Input
            disabled
            type="url"
            placeholder={field.placeholder || field.label}
          />
        );
      case "phone":
        return (
          <Input
            disabled
            type="tel"
            placeholder={field.placeholder || field.label}
          />
        );
      default:
        return (
          <Input
            disabled
            type="text"
            placeholder={field.placeholder || field.label}
          />
        );
    }
  };

  return (
    <div
      ref={ref}
      className={`border rounded p-4 mb-2 bg-white transition-shadow ${
        isPreview ? "" : "cursor-move"
      } ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg">
          {field.label || "Untitled field"}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </h4>

        {!isPreview && (
          <div className="flex items-center gap-2">
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setConfigVisible(!configVisible);
              }}
            >
              {configVisible ? "Hide Config" : "Show Config"}
            </Button>
            <Popconfirm
              title="Remove this item?"
              onConfirm={(e) => {
                e?.stopPropagation?.();
                onUpdateField(null, index);
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button size="small" danger>
                Remove
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      <div className="my-2">{renderPreview()}</div>

      {!isPreview && configVisible && (
        <ProductFieldConfig
          field={field}
          onUpdate={(updated) => onUpdateField(updated, index)}
        />
      )}
    </div>
  );
};

export default ProductFieldElement;
