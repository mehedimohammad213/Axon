// components/PageBuilder/Components/components/DraggableComponent.jsx

import React, { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Tooltip } from "antd";
import {
  HolderOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import ComponentRenderer from "../ComponentRenderer";
import { getComponentTypeLabel } from "../../utils/componentTypeLabels";

const getComponentSummary = (component) => {
  const raw =
    component.value ||
    component.title_en ||
    component.title ||
    component._headless?.altText ||
    "";

  if (typeof raw === "string" && raw.trim()) {
    const plain = raw.replace(/<[^>]*>/g, "").trim();
    if (plain) {
      return plain.length > 56 ? `${plain.slice(0, 56)}…` : plain;
    }
  }

  return null;
};

const DraggableComponent = ({
  component,
  index,
  sectionIndex,
  onUpdate,
  onDelete,
  onDuplicate,
  onEditingStateChange,
  isEditing = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const draggableId = useMemo(() => {
    return component._id || `component-${sectionIndex}-${index}`;
  }, [component._id, sectionIndex, index]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draggableId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const summary = getComponentSummary(component);
  const typeLabel = getComponentTypeLabel(component.type);
  const componentNumber = index + 1;

  const handleToggleCollapse = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsCollapsed((prev) => !prev);
  };

  const handleHeaderClick = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleHeaderKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsCollapsed((prev) => !prev);
    }
  };

  const dragHandleProps = isEditing ? { ...listeners, ...attributes } : {};

  const stopDragPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`component-wrapper overflow-hidden rounded-lg border bg-white transition-shadow ${
        isDragging
          ? "border-dashed border-brand shadow-sm"
          : "border-slate-200 shadow-sm hover:border-slate-300"
      }`}
    >
      <div
        {...dragHandleProps}
        className={`drag-handle flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 select-none ${
          isEditing
            ? "cursor-grab touch-none active:cursor-grabbing"
            : "cursor-pointer"
        }`}
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
      >
        <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
          <Button
            type="text"
            size="small"
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={handleToggleCollapse}
            onPointerDown={stopDragPropagation}
            className="!mr-0 shrink-0 text-slate-400 hover:!bg-slate-200 hover:!text-slate-700"
          />
        </Tooltip>

        <HolderOutlined className="shrink-0 text-sm text-slate-400" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="inline-flex h-6 shrink-0 items-center rounded bg-slate-200 px-2 text-[11px] font-semibold tabular-nums text-slate-700">
            {componentNumber}
          </span>
          <span className="shrink-0 text-sm font-semibold text-slate-800">
            {typeLabel}
          </span>
          {isCollapsed && summary && (
            <span className="truncate text-sm text-slate-500">— {summary}</span>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div
          className={`bg-white p-5 ${isDragging ? "pointer-events-none" : ""}`}
          onPointerDown={stopDragPropagation}
        >
          <ComponentRenderer
            component={{
              ...component,
              sectionIndex: sectionIndex,
              index: index,
            }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onEditingStateChange={onEditingStateChange}
            isEditing={isEditing}
          />
        </div>
      )}
    </div>
  );
};

export default DraggableComponent;
