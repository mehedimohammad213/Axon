import React, { useMemo, useState } from "react";
import { Button, Empty } from "antd";
import { PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import ProductRow from "./ProductRow";

const ProductsList = ({
  products,
  productTypes,
  onView,
  onEdit,
  onDelete,
  onCreate,
  emptyTitle = "No products uploaded yet",
  emptyDescription = "Click Upload Product to add your first item.",
  createLabel = "Upload Product",
}) => {
  const [expandedProductId, setExpandedProductId] = useState(null);

  const typeById = useMemo(() => {
    const map = new Map();
    productTypes.forEach((type) => map.set(String(type.id), type));
    return map;
  }, [productTypes]);

  const handleExpand = (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  const handleDelete = async (productId) => {
    await onDelete?.(productId);
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    }
  };

  if (!products.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <ShoppingOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">{emptyTitle}</p>
              <p className="text-sm text-gray-500">{emptyDescription}</p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="mt-2 bg-brand hover:bg-brand-dark"
            >
              {createLabel}
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            productType={
              product.product_type ||
              typeById.get(String(product.product_type_id))
            }
            expandedProductId={expandedProductId}
            handleExpand={handleExpand}
            onView={onView}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
