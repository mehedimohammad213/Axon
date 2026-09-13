import React from "react";
import { Button, Card, Popconfirm, Tag, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteFilled,
  EditOutlined,
  PlusCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { parseFieldSchema } from "./productUtils";

const ProductTypeRow = ({
  productType,
  expandedTypeId,
  handleExpand,
  onUploadProduct,
  onDelete,
}) => {
  const router = useRouter();
  const isExpanded = expandedTypeId === productType.id;
  const fields = parseFieldSchema(productType.field_schema);

  return (
    <Card
      className={`w-full overflow-hidden rounded-xl border transition-shadow duration-200 ${
        isExpanded
          ? "border-brand/40 shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
      bodyStyle={{ padding: 0 }}
    >
      <div
        className="flex cursor-pointer items-start gap-3 px-5 py-4 sm:items-center"
        onClick={() => handleExpand(productType.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(productType.id);
          }
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isExpanded
              ? "border-brand/30 bg-brand-light text-brand-dark"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleExpand(productType.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <ShoppingOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{productType.id}
            </span>
            <Tag color={productType.status === false ? "default" : "green"}>
              {productType.status === false ? "Inactive" : "Active"}
            </Tag>
            <Tag color="blue">{fields.length} fields</Tag>
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {productType.name || "Untitled product type"}
          </h3>

          {productType.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
              {productType.description}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit product form">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/products/edit-type?id=${productType.id}`)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Type name
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {productType.name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Slug
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-800">
                    {productType.slug || "—"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Form fields
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {fields.length ? (
                      fields.map((field) => (
                        <Tag key={field.id || field.name}>
                          {field.label} ({field.field_type})
                        </Tag>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No fields</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => onUploadProduct?.(productType)}
                className="bg-brand"
              >
                Upload Product
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  router.push(`/products/edit-type?id=${productType.id}`)
                }
              >
                Edit Form
              </Button>
              <Popconfirm
                title="Delete this product type?"
                description="Only allowed when no products use it."
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() => onDelete?.(productType.id)}
              >
                <Button danger icon={<DeleteFilled />}>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductTypeRow;
