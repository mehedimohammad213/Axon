// components/PageBuilder/Components/components/ComponentList.jsx

import React from "react";
import { Button } from "antd";
import { PlusOutlined, AppstoreAddOutlined } from "@ant-design/icons";
import DraggableComponent from "./DraggableComponent";

const AddComponentDivider = ({ onClick, label = "Add component" }) => (
  <div className="flex justify-end pt-2">
    <Button
      icon={<PlusOutlined />}
      onClick={onClick}
      size="small"
      className="!mr-0 inline-flex items-center gap-1.5 rounded-md border-0 bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:!border-0 hover:!bg-emerald-700 hover:!text-white"
    >
      {label}
    </Button>
  </div>
);

const ComponentList = ({
  componentsState,
  sectionIndex,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  onEditingStateChange,
  onAddComponent,
  isEditing = false,
}) => {
  const isEmpty = !componentsState || componentsState.length === 0;

  return (
    <div className="components-container min-h-[72px] space-y-3">
      {isEditing && isEmpty && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <AppstoreAddOutlined className="mb-3 text-3xl text-slate-300" />
          <p className="mb-1 text-sm font-semibold text-slate-800">
            No components yet
          </p>
          <p className="mx-auto mb-5 max-w-sm text-xs leading-relaxed text-slate-500">
            Add content blocks such as text, images, buttons, or media to this
            section.
          </p>
          <div className="flex justify-end">
            <Button
              icon={<PlusOutlined />}
              onClick={() => onAddComponent && onAddComponent(0)}
              size="middle"
              className="!mr-0 inline-flex items-center gap-2 rounded-lg border-0 bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:!border-0 hover:!bg-emerald-700 hover:!text-white"
            >
              Add component
            </Button>
          </div>
        </div>
      )}

      {Array.isArray(componentsState) &&
        componentsState.map((component, index) => (
          <DraggableComponent
            key={component._id || `component-${sectionIndex}-${index}`}
            component={component}
            index={index}
            sectionIndex={sectionIndex}
            onUpdate={(updatedComponent) =>
              onComponentUpdate(updatedComponent, index)
            }
            onDelete={() => onComponentDelete(index)}
            onDuplicate={() => onComponentDuplicate(index)}
            onEditingStateChange={onEditingStateChange}
            isEditing={isEditing}
          />
        ))}

      {isEditing && !isEmpty && (
        <AddComponentDivider
          onClick={() =>
            onAddComponent && onAddComponent(componentsState.length)
          }
        />
      )}

      {!isEditing && isEmpty && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-400">
          No components in this section
        </div>
      )}
    </div>
  );
};

export default ComponentList;
