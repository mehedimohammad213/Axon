import React from "react";
import { Empty, Button } from "antd";
import { PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import ProductTypeRow from "./ProductTypeRow";

const ProductTypesList = ({
  productTypes,
  onUploadProduct,
  onDelete,
  onCreate,
}) => {
  if (!productTypes.length) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <ShoppingOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                No product types yet
              </p>
              <p className="text-sm text-gray-500">
                Create a product type with drag-and-drop fields, then upload
                products.
              </p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create product type
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-4 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {productTypes.map((type) => (
          <ProductTypeRow
            key={type.id}
            productType={type}
            onUploadProduct={onUploadProduct}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductTypesList;
