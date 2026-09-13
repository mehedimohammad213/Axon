import React from "react";
import { Button, Drawer, Switch } from "antd";
import ProductFieldElement from "./ProductFieldElement";

const ProductTypePreview = ({
  visible,
  onCancel,
  onSave,
  loading,
  typeMeta,
  fields,
}) => {
  return (
    <Drawer
      title="Draft Product Form Preview"
      open={visible}
      onClose={onCancel}
      width="60%"
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Discard</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={onSave}
            className="bg-theme"
          >
            Publish Product Type
          </Button>
        </div>
      }
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {typeMeta.name || "Untitled product type"}
        </h2>
        {typeMeta.description && (
          <p className="mt-2 text-gray-600">{typeMeta.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>Status:</span>
          <Switch
            checked={typeMeta.status !== false}
            disabled
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>
      </div>

      <div className="border-2 border-dashed border-theme rounded-lg p-4">
        {fields.length ? (
          fields.map((field, index) => (
            <ProductFieldElement
              key={field.updated_on || field.id || index}
              field={field}
              index={index}
              isPreview
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">
            No fields added yet.
          </p>
        )}
      </div>
    </Drawer>
  );
};

export default ProductTypePreview;
