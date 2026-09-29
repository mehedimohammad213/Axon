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
      width="min(800px, 92vw)"
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel}
            className="headlesscancelbutton headlessbutton-pill !mr-0"
          >
            Discard
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={onSave}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Publish Product Type
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <h2 className="mb-0 text-2xl font-bold text-gray-900">
            {typeMeta.name || "Untitled product type"}
          </h2>
          {typeMeta.description && (
            <p className="mt-2 mb-0 text-gray-600">{typeMeta.description}</p>
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

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
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
            <p className="py-10 text-center text-gray-500">
              No fields added yet.
            </p>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ProductTypePreview;
