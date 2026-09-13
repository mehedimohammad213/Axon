import React from "react";
import { Card } from "antd";
import { useDrop } from "react-dnd";
import ProductFieldElement from "./ProductFieldElement";

const ProductBuilderCanvas = ({ fields, addField, updateFields }) => {
  const [, dropRef] = useDrop({
    accept: ["productField", "productCanvasField"],
    drop: (item, monitor) => {
      if (monitor.getItemType() === "productField") {
        addField(item.element);
      }
    },
  });

  const moveField = (dragIndex, hoverIndex) => {
    const updated = [...fields];
    const [dragged] = updated.splice(dragIndex, 1);
    updated.splice(hoverIndex, 0, dragged);
    updateFields(updated);
  };

  const handleUpdateField = (updatedField, index) => {
    const next = [...fields];
    if (updatedField === null) {
      next.splice(index, 1);
    } else {
      next[index] = updatedField;
    }
    updateFields(next);
  };

  return (
    <Card
      ref={dropRef}
      className="border-2 border-dashed border-theme h-[60vh] overflow-auto p-4"
    >
      <h3 className="text-xl font-bold text-center mb-4">
        Product Form Canvas
      </h3>
      {fields?.length ? (
        fields.map((field, index) => (
          <ProductFieldElement
            key={field.updated_on || field.id || index}
            field={field}
            index={index}
            moveField={moveField}
            onUpdateField={handleUpdateField}
          />
        ))
      ) : (
        <p className="text-center text-gray-500 mt-16">
          Drag elements from the right panel to build your product form.
        </p>
      )}
    </Card>
  );
};

export default ProductBuilderCanvas;
