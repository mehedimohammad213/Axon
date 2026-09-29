// TableSelectionModal/HeadersSection.jsx

import React from "react";
import { Input, Button, Typography, Checkbox } from "antd";
import { PlusOutlined, MinusOutlined, DragOutlined } from "@ant-design/icons";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

const { Title } = Typography;

/** Reorder columns in each row of the table data. */
const reorderColumnsInRows = (rows, sourceIndex, destIndex) => {
  return rows.map((row) => {
    const newData = [...(row.data || [])];
    const [removed] = newData.splice(sourceIndex, 1);
    newData.splice(destIndex, 0, removed);
    return { ...row, data: newData };
  });
};

const SortableHeaderItem = ({
  colObj,
  index,
  visibleColumns,
  toggleColumnVisibility,
  updateHeaderName,
  removeHeader,
  headers,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: colObj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
    >
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-white hover:text-gray-700"
        style={{ cursor: "grab", touchAction: "none" }}
        aria-label="Drag column"
        {...attributes}
        {...listeners}
      >
        <DragOutlined />
      </button>

      <Input
        style={{ width: 180 }}
        placeholder={`Column ${index + 1}`}
        value={colObj.name}
        onChange={(e) => updateHeaderName(e.target.value, index)}
      />

      <Checkbox
        checked={Boolean(visibleColumns[index])}
        onChange={(e) => toggleColumnVisibility(index, e.target.checked)}
      >
        Visible
      </Checkbox>

      {headers.length > 1 && (
        <Button
          shape="circle"
          icon={<MinusOutlined />}
          danger
          onClick={() => removeHeader(index)}
        />
      )}
    </div>
  );
};

const HeadersSection = ({
  headers,
  setHeaders,
  visibleColumns,
  setVisibleColumns,
  rows,
  setRows,
  filterColumns,
  setFilterColumns,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addHeader = () => {
    const newHeader = { id: uuidv4(), name: `Column ${headers.length + 1}` };
    setHeaders([...headers, newHeader]);
    setVisibleColumns([...visibleColumns, true]);
    setRows(rows.map((r) => ({ ...r, data: [...(r.data || []), ""] })));
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
    setVisibleColumns(visibleColumns.filter((_, i) => i !== index));
    setRows(
      rows.map((r) => {
        const dataCopy = [...(r.data || [])];
        dataCopy.splice(index, 1);
        return { ...r, data: dataCopy };
      })
    );

    const removedName = headers[index]?.name;
    if (removedName) {
      setFilterColumns(filterColumns.filter((name) => name !== removedName));
    }
  };

  const updateHeaderName = (value, index) => {
    const oldName = headers[index].name;
    const updated = [...headers];
    updated[index] = { ...updated[index], name: value };
    setHeaders(updated);

    if (filterColumns.includes(oldName)) {
      setFilterColumns(
        filterColumns.map((fc) => (fc === oldName ? value : fc))
      );
    }
  };

  const toggleColumnVisibility = (index, checked) => {
    const updatedVis = [...visibleColumns];
    updatedVis[index] = checked;
    setVisibleColumns(updatedVis);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = headers.findIndex((header) => header.id === active.id);
    const newIndex = headers.findIndex((header) => header.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setHeaders(arrayMove(headers, oldIndex, newIndex));
    setVisibleColumns(arrayMove(visibleColumns, oldIndex, newIndex));
    setRows(reorderColumnsInRows(rows, oldIndex, newIndex));
  };

  return (
    <div>
      <Title level={5} className="!mb-3 !text-gray-900">
        Columns
      </Title>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={headers.map((header) => header.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-row flex-wrap gap-3 rounded-2xl border border-gray-200 bg-gray-50/80 p-4">
            {headers.map((colObj, index) => (
              <SortableHeaderItem
                key={colObj.id}
                colObj={colObj}
                index={index}
                visibleColumns={visibleColumns}
                toggleColumnVisibility={toggleColumnVisibility}
                updateHeaderName={updateHeaderName}
                removeHeader={removeHeader}
                headers={headers}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={addHeader}
          icon={<PlusOutlined />}
          className="headlessbutton headlessbutton-pill"
        >
          Add Column
        </Button>
      </div>
    </div>
  );
};

export default HeadersSection;
