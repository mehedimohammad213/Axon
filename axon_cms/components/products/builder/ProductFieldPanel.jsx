import React from "react";
import { Card } from "antd";
import DraggableProductField from "./DraggableProductField";
import { PRODUCT_FIELD_PALETTE } from "./productFieldPalette";

const ProductFieldPanel = () => {
  return (
    <>
      <h3 className="text-center text-lg sm:text-xl font-bold px-2">Elements</h3>
      <Card className="border-2 border-theme p-2 sm:p-4 h-[65vh] overflow-auto mt-4 sm:mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-4">
          {PRODUCT_FIELD_PALETTE.map((element, index) => (
            <DraggableProductField key={index} element={element} />
          ))}
        </div>
      </Card>
    </>
  );
};

export default ProductFieldPanel;
