import React, { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";
import ComponentRenderer from "./ComponentRenderer";

const Component = ({ component, index, onUpdate, onDelete }) => {
  // Use stable ID generation
  const draggableId = useMemo(() => {
    return component._id || `component-${index}`;
  }, [component._id, index]);

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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="component bg-white shadow-sm rounded-md p-4 mb-3"
    >
      <div
        {...listeners}
        {...attributes}
        className="component-header flex justify-end mb-2 gap-2 cursor-move"
      >
        <ComponentDuplicateButton
          onClick={() => {
            const duplicateEvent = new CustomEvent("duplicateComponent", {
              detail: { componentIndex: index },
            });
            window.dispatchEvent(duplicateEvent);
          }}
          title="Duplicate component"
        />
        <ComponentDeleteButton
          onConfirm={onDelete}
          title="Delete component"
          confirmTitle="Delete component?"
        />
      </div>
      <ComponentRenderer
        component={component}
        onChange={(updatedComponent) => onUpdate(updatedComponent)}
      />
    </div>
  );
};

export default Component;
