// components/PageBuilder/Sections/Section.jsx

import React, { useState, useCallback, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button, Modal, Input, Popconfirm, Tooltip } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  UpOutlined,
  DownOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import ComponentListSimple from "../Components/ComponentListSimple";
import InsertionIndicator from "../Components/InsertionIndicator";
import { useDispatch } from "react-redux";
import { updateSection, setIsDirty } from "../../../store/slices/pageSlice";

const Section = ({
  section,
  sectionIndex,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  onEditingStateChange,
  index,
  onDuplicate,
  onDelete,
  onSectionDuplicate,
  onSectionDelete,
  isEditing = false,
  dragOverSection,
  activeId,
  isDraggingSection = false,
}) => {
  const dispatch = useDispatch();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [tempTitle, setTempTitle] = useState(
    section.title || `Section ${(sectionIndex || index) + 1}`
  );

  React.useEffect(() => {
    setTempTitle(section.title || `Section ${(sectionIndex || index) + 1}`);
  }, [section.title, sectionIndex, index]);

  const draggableId = useMemo(() => {
    return section._id || `section-${sectionIndex || index}`;
  }, [section._id, sectionIndex, index]);

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

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-drop-${sectionIndex || index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const combinedRef = useCallback(
    (node) => {
      setNodeRef(node);
      setDroppableRef(node);
    },
    [setNodeRef, setDroppableRef]
  );

  const handleComponentEditingStateChange = useCallback(
    (editing) => {
      if (onEditingStateChange) {
        onEditingStateChange(editing);
      }
    },
    [onEditingStateChange]
  );

  const handleComponentsUpdate = useCallback(
    (updatedComponents) => {
      const updatedSection = {
        ...section,
        data: updatedComponents,
      };

      dispatch(
        updateSection({
          sectionIndex: sectionIndex || index,
          newSection: updatedSection,
        })
      );
      dispatch(setIsDirty(true));
    },
    [section, sectionIndex, index, dispatch]
  );

  const handleDeleteClick = (e) => {
    e.stopPropagation();
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(sectionIndex || index);
    } else if (onSectionDelete) {
      onSectionDelete(sectionIndex || index);
    }
  };

  const handleDuplicateClick = (e) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(sectionIndex || index);
    } else if (onSectionDuplicate) {
      onSectionDuplicate(sectionIndex || index);
    }
  };

  const handleTitleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim() === "") {
      Modal.error({
        title: "Validation Error",
        content: "Section title cannot be empty.",
      });
      return;
    }
    dispatch(
      updateSection({
        sectionIndex: sectionIndex || index,
        newSection: {
          ...section,
          title: tempTitle,
        },
      })
    );
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(section.title || `Section ${(sectionIndex || index) + 1}`);
    setIsEditingTitle(false);
  };

  const handleToggleCollapse = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsCollapsed((prev) => !prev);
  };

  const handleHeaderClick = () => {
    if (!isEditingTitle) {
      setIsCollapsed((prev) => !prev);
    }
  };

  const handleHeaderKeyDown = (e) => {
    if (isEditingTitle) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsCollapsed((prev) => !prev);
    }
  };

  const componentCount = section.data?.length || 0;
  const sectionNumber = (sectionIndex || index) + 1;
  const sectionTitle = section.title || `Section ${sectionNumber}`;
  const resolvedIndex = sectionIndex || index;
  const dragHandleProps = isEditing ? { ...listeners, ...attributes } : {};

  const stopDragPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      className={`section-container overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow ${
        isOver && !isDraggingSection
          ? "border-brand ring-2 ring-brand/20"
          : "border-slate-200"
      } ${isDragging ? "shadow-md" : "hover:shadow-md"}`}
    >
      <div
        {...dragHandleProps}
        className={`section-header flex items-center justify-between gap-4 px-5 py-4 ${
          isCollapsed ? "border-b-0" : "border-b border-slate-200"
        } bg-slate-50 ${
          isEditing
            ? "cursor-grab touch-none active:cursor-grabbing"
            : isEditingTitle
              ? ""
              : "cursor-pointer"
        }`}
        onClick={handleHeaderClick}
        onKeyDown={handleHeaderKeyDown}
        role={isEditingTitle ? undefined : "button"}
        tabIndex={isEditingTitle ? undefined : 0}
        aria-expanded={!isCollapsed}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
            <Button
              type="text"
              size="small"
              icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={handleToggleCollapse}
              onPointerDown={stopDragPropagation}
              className="!mr-0 shrink-0 text-slate-500 hover:!bg-slate-200 hover:!text-slate-800"
            />
          </Tooltip>

          <HolderOutlined className="shrink-0 text-base text-slate-400" />

          <span className="inline-flex h-7 shrink-0 items-center rounded-md bg-slate-800 px-2.5 text-xs font-semibold tabular-nums text-white">
            {sectionNumber}
          </span>

          {isEditingTitle ? (
            <div
              className="flex min-w-0 flex-1 items-center gap-2"
              onClick={stopDragPropagation}
              onPointerDown={stopDragPropagation}
              onKeyDown={stopDragPropagation}
            >
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onPressEnter={handleTitleSave}
                autoFocus
                className="max-w-sm flex-1"
                size="middle"
              />
              <Button
                icon={<CheckOutlined />}
                onClick={handleTitleSave}
                className="headlessbutton !mr-0"
                size="small"
              />
              <Button
                icon={<CloseOutlined />}
                onClick={handleTitleCancel}
                className="headlesscancelbutton !mr-0"
                size="small"
              />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h3 className="truncate text-base font-semibold leading-snug text-slate-900">
                {sectionTitle}
              </h3>
              <span className="hidden shrink-0 text-sm text-slate-500 sm:inline">
                · {componentCount}{" "}
                {componentCount === 1 ? "component" : "components"}
              </span>
              {isEditing && (
                <Tooltip title="Rename section">
                  <Button
                    icon={<EditOutlined />}
                    onClick={handleTitleEdit}
                    onPointerDown={stopDragPropagation}
                    size="small"
                    type="text"
                    className="!mr-0 shrink-0 text-slate-400 hover:!bg-slate-200 hover:!text-slate-700"
                  />
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={stopDragPropagation}
            onPointerDown={stopDragPropagation}
            onKeyDown={stopDragPropagation}
          >
            {(onDuplicate || onSectionDuplicate) && (
              <Tooltip title="Duplicate section">
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleDuplicateClick}
                  size="small"
                  type="text"
                  className="!mr-0 text-slate-500 hover:!bg-slate-200 hover:!text-slate-800"
                />
              </Tooltip>
            )}
            {(onDelete || onSectionDelete) && (
              <Popconfirm
                title="Delete section?"
                description="This cannot be undone."
                onConfirm={handleDeleteConfirm}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Delete section">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteClick}
                    size="small"
                    type="text"
                    className="headlesscancelbutton !mr-0"
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div
          className="bg-white px-5 py-5 sm:px-6 sm:py-6"
          onPointerDown={stopDragPropagation}
        >
          <InsertionIndicator
            isVisible={
              isEditing &&
              activeId &&
              !isDraggingSection &&
              dragOverSection === resolvedIndex &&
              section.data.length === 0
            }
            position="top"
          />

          <ComponentListSimple
            components={section.data}
            onComponentsUpdate={handleComponentsUpdate}
            onComponentDelete={onComponentDelete}
            onComponentDuplicate={onComponentDuplicate}
            onEditingStateChange={handleComponentEditingStateChange}
            sectionIndex={resolvedIndex}
            isEditing={isEditing}
          />

          <InsertionIndicator
            isVisible={
              isEditing &&
              activeId &&
              !isDraggingSection &&
              dragOverSection === resolvedIndex &&
              section.data.length > 0
            }
            position="bottom"
          />
        </div>
      )}
    </div>
  );
};

export default Section;
