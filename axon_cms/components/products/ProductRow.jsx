import React, { useMemo } from "react";
import { Button, Card, Image, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
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
  const typeName = product.product_type?.name || productType?.name || "";

  const toggleCard = () => {
    handleExpand(product.id);
  };

  return (
    <Card
      className={`w-full cursor-pointer overflow-hidden rounded-xl border transition-shadow duration-200 ${
        isExpanded
          ? "border-brand/40 shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
      bodyStyle={{ padding: 0 }}
      onClick={toggleCard}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleCard();
        }
      }}
    >
      <div className="flex min-h-[88px] items-center gap-3 px-5 py-4">
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
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
                  : "bg-brand-light text-brand-dark"
              }`}
            >
              {inactive ? "Inactive" : "Active"}
            </span>
            {typeName && (
              <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                {typeName}
              </span>
            )}
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={product.title || "Untitled product"}
          >
            {product.title || "Untitled product"}
          </h3>

          <Tooltip title={product.slug || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {product.slug || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView?.(product)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit?.(product)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            description="This cannot be undone."
            onConfirm={() => onDelete?.(product.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              icon: <DeleteFilled />,
            }}
            cancelButtonProps={{
              icon: <CloseCircleOutlined />,
            }}
          >
            <Button
              icon={<DeleteFilled />}
              className="headlesscancelbutton headlessbutton-pill !mr-0"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {isExpanded && (
        <div
          className="border-t border-gray-100 px-5 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Title">{product.title || "—"}</InfoRow>
              <InfoRow label="Slug">{product.slug || "—"}</InfoRow>
              <InfoRow label="Product type">{typeName || "—"}</InfoRow>
              <InfoRow label="Status">{inactive ? "Inactive" : "Active"}</InfoRow>
              {product.description && (
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 line-clamp-3 break-words text-sm font-medium text-gray-800">
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
        </div>
      )}
    </Card>
  );
};

export default ProductRow;
