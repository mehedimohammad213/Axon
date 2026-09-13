// components/PageBuilder/Components/ParagraphComponent.jsx

import React, { useState } from "react";
import { Button, Modal, Popconfirm, Space, Tooltip, Switch, Collapse } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ExportOutlined,
  CopyFilled,
  DragOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import RichTextEditor from "../../RichTextEditor";
import { sanitizeHtmlColorsForPreview } from "../utils/previewContrast";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const { Panel } = Collapse;

const ParagraphComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  // Safety check for null component
  if (!component) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    content: component?.value || "",
    altContent: component?._headless?.altContent || "",
    showAltContent: component?._headless?.showAltContent || false,
  });

  const handleSubmit = () => {
    if (formData.content.trim() === "") {
      Modal.error({
        title: "Validation Error",
        content: "Paragraph content cannot be empty.",
      });
      return;
    }

    const updatedComponent = {
      ...component,
      value: formData.content,
      _headless: {
        ...component._headless,
        altContent: formData.altContent,
        showAltContent: formData.showAltContent,
      },
    };

    updateComponent(updatedComponent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      content: component?.value || "",
      altContent: component?._headless?.altContent || "",
      showAltContent: component?._headless?.showAltContent || false,
    });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    deleteComponent();
  };

  if (preview) {
    const content = sanitizeHtmlColorsForPreview(formData.content || "");
    const altContent = sanitizeHtmlColorsForPreview(formData.altContent || "");

    return (
      <div className="preview-paragraph-component px-5 py-4">
        {content ? (
          <div
            className="prose prose-slate max-w-none text-slate-700 prose-p:my-1"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-sm italic text-slate-400">No paragraph content</p>
        )}
        {formData.showAltContent && formData.altContent && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              Alternative
            </div>
            <div
              className="prose prose-slate max-w-none italic text-slate-600"
              dangerouslySetInnerHTML={{ __html: altContent }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg bg-white transition-all duration-200 ${
        isHovered ? "shadow-md" : "shadow-sm"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <DragOutlined className="text-xl text-gray-400 cursor-move hover:text-gray-600 transition-colors" />
            <h3 className="text-lg font-semibold text-gray-700">
              Paragraph Component
            </h3>
          </div>
          <Space>
            {isEditing ? (
              <>
                <Tooltip title="Save changes">
                  <Button
                    icon={<CheckOutlined />}
                    onClick={handleSubmit}
                    className="headlessbutton"
                  >
                    Save
                  </Button>
                </Tooltip>
                <Tooltip title="Cancel editing">
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleCancel}
                    className="headlesscancelbutton"
                  >
                    Cancel
                  </Button>
                </Tooltip>
              </>
            ) : (
              <>
                {(component?.value || component?._headless?.altContent) && (
                  <ComponentEditButton
                    onClick={() => setIsEditing(true)}
                    title="Edit paragraph"
                  />
                )}
                <ComponentDuplicateButton
                  onClick={onDuplicateElement}
                  title="Duplicate component"
                />
                <ComponentDeleteButton
                  onConfirm={handleDelete}
                  title="Delete component"
                  confirmTitle="Delete Paragraph"
                  confirmDescription="Are you sure you want to delete this paragraph?"
                />
              </>
            )}
          </Space>
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <Collapse defaultActiveKey={["1", "2"]} ghost>
              <Panel header="Main Content" key="1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <RichTextEditor
                    defaultValue={formData.content}
                    onChange={(html) => handleChange("content", html)}
                    editMode={true}
                    maxLength={5000}
                  />
                </div>
              </Panel>
              <Panel header="Multi-Language Support" key="2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Enable Alternative Content
                    </label>
                    <Switch
                      checked={formData.showAltContent}
                      onChange={(checked) => handleChange("showAltContent", checked)}
                    />
                  </div>
                  {formData.showAltContent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternative Content
                      </label>
                      <RichTextEditor
                        defaultValue={formData.altContent}
                        onChange={(html) => handleChange("altContent", html)}
                        editMode={true}
                        maxLength={5000}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        <GlobalOutlined className="mr-1" />
                        Add content in another language for multi-language support
                      </p>
                    </div>
                  )}
                </div>
              </Panel>
            </Collapse>
          </div>
        ) : component?.value ? (
          <div className="space-y-4">
            <div
              className="prose prose-slate max-w-none rounded-lg bg-white p-4 text-slate-700"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlColorsForPreview(component.value),
              }}
            />
            {formData.showAltContent && formData.altContent && (
              <div
                className="prose prose-slate max-w-none rounded-lg bg-slate-50 p-4 italic text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtmlColorsForPreview(formData.altContent),
                }}
              />
            )}
          </div>
        ) : (
          <Button
            icon={<PlusOutlined />}
            type="dashed"
            onClick={() => {
              setIsEditing(true);
              setFormData({
                content: "",
                altContent: "",
                showAltContent: false,
              });
            }}
            className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-brand transition-colors"
          >
            <span className="text-lg font-medium text-gray-600">
              Add Paragraph
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ParagraphComponent;
