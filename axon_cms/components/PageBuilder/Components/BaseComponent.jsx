import React from "react";
import { Button } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DragOutlined,
} from "@ant-design/icons";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const BaseComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
  title,
  children,
  isEditing,
  setIsEditing,
  onEdit,
  onCancel,
  onSave,
  showChangeButton = true,
  showDuplicateButton = true,
  showDeleteButton = true,
}) => {
  const handleDelete = () => {
    console.log("🔧 Delete button clicked in BaseComponent");
    deleteComponent();
  };

  if (preview) {
    return (
      <div className="preview-component p-6 bg-gray-50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
        {children}
      </div>
    );
  }

  return (
    <div className="component-wrapper bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md border border-gray-100">
      {/* Header */}
      <div className="component-header p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="drag-handle p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <DragOutlined className="text-xl text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {showChangeButton && (
                  <ComponentEditButton onClick={onEdit} title="Edit component" />
                )}
                {showDuplicateButton && (
                  <ComponentDuplicateButton
                    onClick={onDuplicateElement}
                    title="Duplicate component"
                  />
                )}
                {showDeleteButton && (
                  <ComponentDeleteButton
                    onConfirm={handleDelete}
                    title="Delete component"
                    confirmTitle="Are you sure you want to delete this component?"
                  />
                )}
              </>
            ) : (
              <>
                <Button
                  icon={<CheckOutlined />}
                  onClick={onSave}
                  className="headlessbutton"
                >
                  Done
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={onCancel}
                  className="headlesscancelbutton"
                >
                  Discard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="component-content p-6">{children}</div>
    </div>
  );
};

export default BaseComponent;
