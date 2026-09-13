import React, { useRef, useEffect, useState } from "react";
import {
  Input,
  Button,
  Typography,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  DragOutlined,
  CloudUploadOutlined,
  EditOutlined,
  FormOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import MediaSelectionModal from "../MediaSelectionModal";
import { resolveMediaUrl } from "../../../../utils/mediaUrl";
import { isImageCellValue } from "../../../tables/tableUtils";

const { Title } = Typography;

const actionBtnStyle = {
  width: 28,
  height: 28,
  minWidth: 28,
  padding: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#4b5563",
};

const CellImagePreview = ({ value, size = 36, previewSize = 220 }) => {
  const src = resolveMediaUrl(value);

  const preview = (
    <div className="p-1">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <img
          src={src}
          alt="Cell preview"
          className="max-h-[220px] max-w-[220px] object-contain"
          style={{ width: previewSize, height: previewSize }}
        />
      </div>
    </div>
  );

  return (
    <Tooltip
      title={preview}
      placement="rightTop"
      color="#ffffff"
      overlayInnerStyle={{ padding: 4 }}
      mouseEnterDelay={0.15}
    >
      <div className="inline-flex cursor-zoom-in items-center justify-center transition-transform hover:scale-105">
        <img
          src={src}
          alt="Cell"
          width={size}
          height={size}
          style={{
            objectFit: "cover",
            borderRadius: 6,
            flexShrink: 0,
            border: "1px solid #e5e7eb",
            display: "block",
          }}
        />
      </div>
    </Tooltip>
  );
};

const CellEditor = ({
  value,
  rowIndex,
  colIndex,
  placeholder,
  inputRef,
  onChangeText,
  onKeyDown,
  onOpenImagePicker,
  onClearImage,
}) => {
  const isImage = isImageCellValue(value);

  if (isImage) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 border-b border-r border-gray-300 bg-white"
        style={{ minWidth: 170, minHeight: 44 }}
      >
        <CellImagePreview value={value} />
        <div className="flex items-center gap-1">
          <Tooltip title="Change image">
            <Button
              type="text"
              size="small"
              icon={<CloudUploadOutlined style={{ fontSize: 14 }} />}
              onClick={() => onOpenImagePicker(rowIndex, colIndex)}
              style={{ ...actionBtnStyle, color: "#2563eb", borderColor: "#bfdbfe", background: "#eff6ff" }}
            />
          </Tooltip>
          <Tooltip title="Switch to text">
            <Button
              type="text"
              size="small"
              icon={<FormOutlined style={{ fontSize: 14 }} />}
              onClick={() => onClearImage(rowIndex, colIndex)}
              style={actionBtnStyle}
            />
          </Tooltip>
          <Tooltip title="Remove image">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined style={{ fontSize: 12 }} />}
              onClick={() => onClearImage(rowIndex, colIndex)}
              style={{ ...actionBtnStyle, color: "#dc2626", borderColor: "#fecaca", background: "#fef2f2" }}
            />
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-stretch border-b border-r border-gray-300 bg-white"
      style={{ minWidth: 170 }}
    >
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChangeText(e.target.value, rowIndex, colIndex)}
        onKeyDown={(e) => onKeyDown(e, rowIndex, colIndex)}
        className="border-0 text-center !rounded-none !shadow-none"
        ref={inputRef}
        style={{ flex: 1, minWidth: 100 }}
        prefix={<EditOutlined className="text-gray-300" style={{ fontSize: 12 }} />}
      />
      <Tooltip title="Upload image">
        <Button
          type="text"
          icon={<CloudUploadOutlined style={{ fontSize: 15 }} />}
          onClick={() => onOpenImagePicker(rowIndex, colIndex)}
          className="!rounded-none"
          style={{
            height: "auto",
            width: 36,
            borderLeft: "1px solid #e5e7eb",
            color: "#2563eb",
            background: "#f8fafc",
          }}
        />
      </Tooltip>
    </div>
  );
};

const SortableRow = ({
  row,
  rowIndex,
  headers,
  updateCell,
  handleKeyDown,
  removeRow,
  rowsCount,
  cellRefs,
  onOpenImagePicker,
  onClearImage,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="flex items-center px-2 border-b border-l border-gray-300 bg-gray-50 text-gray-600"
        style={{ cursor: "grab", touchAction: "none" }}
        aria-label="Drag row"
        {...attributes}
        {...listeners}
      >
        <DragOutlined />
      </button>

      {headers.map((colObj, colIndex) => (
        <CellEditor
          key={`${row.id}_${colIndex}`}
          value={row.data[colIndex] ?? ""}
          rowIndex={rowIndex}
          colIndex={colIndex}
          placeholder={`Row ${rowIndex + 1} - ${colObj.name}`}
          inputRef={cellRefs.current?.[rowIndex]?.[colIndex]}
          onChangeText={updateCell}
          onKeyDown={handleKeyDown}
          onOpenImagePicker={onOpenImagePicker}
          onClearImage={onClearImage}
        />
      ))}

      {rowsCount > 1 && (
        <div className="flex items-center px-2 border-b border-gray-300">
          <Popconfirm
            title="Are you sure you want to delete this row?"
            onConfirm={() => removeRow(rowIndex)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete row">
              <Button
                type="text"
                icon={<MinusOutlined style={{ fontSize: 12 }} />}
                style={{
                  width: 28,
                  height: 28,
                  minWidth: 28,
                  padding: 0,
                  borderRadius: 6,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#dc2626",
                }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      )}
    </div>
  );
};

const RowsSection = ({ headers, rows, setRows }) => {
  const cellRefs = useRef([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [activeCell, setActiveCell] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    cellRefs.current = rows.map((r, rowIndex) =>
      headers.map(
        (_, colIndex) =>
          cellRefs.current?.[rowIndex]?.[colIndex] || React.createRef()
      )
    );
  }, [rows, headers]);

  const addRow = () => {
    if (headers.length === 0) {
      message.info("No headers defined. Please add columns first.");
      return;
    }
    const newRow = { id: uuidv4(), data: Array(headers.length).fill("") };
    setRows((prev) => [...prev, newRow]);

    setTimeout(() => {
      const newRowIndex = rows.length;
      cellRefs.current?.[newRowIndex]?.[0]?.current?.focus();
    }, 0);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const updateCell = (value, rowIndex, colIndex) => {
    setRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              data: [
                ...row.data.slice(0, colIndex),
                value,
                ...row.data.slice(colIndex + 1),
              ],
            }
          : row
      )
    );
  };

  const clearImage = (rowIndex, colIndex) => {
    updateCell("", rowIndex, colIndex);
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    const focusCell = (r, c) => {
      if (r >= 0 && r < rows.length && c >= 0 && c < headers.length) {
        if (isImageCellValue(rows[r]?.data?.[c])) return;
        cellRefs.current?.[r]?.[c]?.current?.focus();
      }
    };

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusCell(rowIndex, colIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusCell(rowIndex, colIndex - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusCell(rowIndex - 1, colIndex);
        break;
      case "ArrowDown":
      case "Enter":
        e.preventDefault();
        focusCell(rowIndex + 1, colIndex);
        break;
      default:
        break;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => row.id === active.id);
    const newIndex = rows.findIndex((row) => row.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setRows((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const openImagePicker = (rowIndex, colIndex) => {
    setActiveCell({ rowIndex, colIndex });
    setMediaModalVisible(true);
  };

  const handleSelectMedia = (mediaItem) => {
    if (mediaItem && activeCell) {
      const path = mediaItem.file_path || "";
      updateCell(path, activeCell.rowIndex, activeCell.colIndex);
    }
    setMediaModalVisible(false);
    setActiveCell(null);
  };

  return (
    <div className="mt-10">
      <Title level={4} className="mb-2">
        Rows
      </Title>
      <Typography.Text type="secondary" className="block mb-2">
        Type text in any cell, or click the image icon to upload an image for
        that cell only.
      </Typography.Text>

      <div
        className={`my-4 border border-gray-300 rounded-md p-4 ${
          headers.length > 5 ? "overflow-x-auto" : ""
        }`}
        style={{ maxWidth: "100%" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((row) => row.id)}
            strategy={verticalListSortingStrategy}
          >
            {rows?.map((row, rowIndex) => (
              <SortableRow
                key={row.id}
                row={row}
                rowIndex={rowIndex}
                headers={headers}
                updateCell={updateCell}
                handleKeyDown={handleKeyDown}
                removeRow={removeRow}
                rowsCount={rows.length}
                cellRefs={cellRefs}
                onOpenImagePicker={openImagePicker}
                onClearImage={clearImage}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={addRow}
          icon={<PlusOutlined />}
          className="headlessbutton"
        >
          Add Row
        </Button>
      </div>

      <MediaSelectionModal
        isVisible={mediaModalVisible}
        onClose={() => {
          setMediaModalVisible(false);
          setActiveCell(null);
        }}
        onSelectMedia={handleSelectMedia}
        selectionMode="single"
      />
    </div>
  );
};

export default RowsSection;
