import React, { useMemo } from "react";
import { Button, Card, Image, Popconfirm, Tag, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteFilled,
  EditOutlined,
  EyeOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { getFieldDisplayValue, getListFields } from "./productUtils";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const InfoRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-800">
      {children}
    </dd>
  </div>
);

const isInactive = (status) => status === false || status === 0;

const ProductRow = ({
  product,
  productType,
  expandedProductId,
  handleExpand,
  onView,
  onEdit,
  onDelete,
}) => {
  const isExpanded = expandedProductId === product.id;
  const inactive = isInactive(product.status);
  const listFields = useMemo(
    () => getListFields(productType).slice(0, 6),
    [productType]
  );
  const thumbnail = product.media_files?.file_path
    ? resolveMediaUrl(product.media_files.file_path)
    : null;

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
        onClick={() => handleExpand(product.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(product.id);
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
            handleExpand(product.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={product.title || "Product"}
              width={48}
              height={48}
              className="h-12 w-12 object-cover"
              preview={false}
            />
          ) : (
            <ShoppingOutlined className="text-lg" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{product.id}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                inactive
                  ? "bg-gray-100 text-gray-500"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {inactive ? "Inactive" : "Active"}
            </span>
            {(product.product_type?.name || productType?.name) && (
              <Tag color="blue" className="m-0">
                {product.product_type?.name || productType?.name}
              </Tag>
            )}
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {product.title || "Untitled product"}
          </h3>

          {product.slug && (
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {product.slug}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="View product">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onView?.(product)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
            <Tooltip title="Edit product">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(product)}
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
                <InfoRow label="Title">{product.title || "—"}</InfoRow>
                <InfoRow label="Slug">{product.slug || "—"}</InfoRow>
                <InfoRow label="Product type">
                  {product.product_type?.name || productType?.name || "—"}
                </InfoRow>
                <InfoRow label="Status">
                  {inactive ? "Inactive" : "Active"}
                </InfoRow>
                {product.description && (
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Description
                    </dt>
                    <dd className="mt-1 line-clamp-3 break-words text-sm text-gray-700">
                      {product.description}
                    </dd>
                  </div>
                )}
                {listFields.map((field) => (
                  <InfoRow key={field.name} label={field.label || field.name}>
                    {getFieldDisplayValue(product, field.name)}
                  </InfoRow>
                ))}
              </dl>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                icon={<EyeOutlined />}
                onClick={() => onView?.(product)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                View
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => onEdit?.(product)}
                className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this product?"
                description="This cannot be undone."
                onConfirm={() => onDelete?.(product.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteFilled />}
                  danger
                  className="!mr-0 ml-auto h-9 rounded-lg px-4 text-sm font-medium"
                >
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

export default ProductRow;
