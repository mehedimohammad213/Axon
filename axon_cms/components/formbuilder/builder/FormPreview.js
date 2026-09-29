// components/formbuilder/builder/FormPreview.js
import React from "react";
import { Drawer, Button } from "antd";
import FormElement from "./FormElement";

const FormPreview = ({
  visible,
  onCancel,
  onSave,
  formMeta,
  formAttributes,
  formElements,
  loading,
}) => {
  const safeDescription =
    typeof formMeta.description === "string" ? formMeta.description : "";

  return (
    <Drawer
      title="Draft Form Preview"
      open={visible}
      onClose={onCancel}
      width="min(800px, 92vw)"
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
            onClick={onSave}
            className="headlessbutton headlessbutton-pill !mr-0"
            loading={loading}
          >
            Publish Form
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
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            {formMeta.title || "Untitled Form"}
          </h3>
          <div
            className="mb-0 text-gray-700"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          {formElements.map((element, idx) => (
            <FormElement
              key={element.updated_on}
              element={element}
              index={idx}
              moveElement={() => {}}
              onUpdateElement={() => {}}
              isPreview={true}
            />
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default FormPreview;
