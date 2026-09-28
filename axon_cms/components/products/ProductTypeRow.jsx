import React from "react";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  EditOutlined,
  PlusCircleOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { parseFieldSchema } from "./productUtils";

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
  const inactive = isInactive(productType.status);

  const toggleCard = () => {
    handleExpand(productType.id);
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
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                inactive
                  ? "bg-gray-100 text-gray-500"
                  : "bg-brand-light text-brand-dark"
              }`}
            >
              {inactive ? "Inactive" : "Active"}
            </span>
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {fields.length} field{fields.length !== 1 ? "s" : ""}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={productType.name || "Untitled product type"}
          >
            {productType.name || "Untitled product type"}
          </h3>

          <Tooltip
            title={productType.description || productType.slug || undefined}
            placement="topLeft"
          >
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {productType.description || productType.slug || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<PlusCircleOutlined />}
            onClick={() => onUploadProduct?.(productType)}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Upload
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() =>
              router.push(`/products/edit-type?id=${productType.id}`)
            }
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this product type?"
            description="Only allowed when no products use it."
            onConfirm={() => onDelete?.(productType.id)}
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
          <div className="space-y-5 pt-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Type name">{productType.name || "—"}</InfoRow>
              <InfoRow label="Slug">{productType.slug || "—"}</InfoRow>
              <InfoRow label="Status">{inactive ? "Inactive" : "Active"}</InfoRow>
              <InfoRow label="Fields">{fields.length}</InfoRow>
              <InfoRow label="Description">
                {productType.description || "—"}
              </InfoRow>
            </dl>

            {fields.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingOutlined className="text-sm text-brand-dark" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    Form fields
                  </h4>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {fields.map((field) => (
                    <li key={field.id || field.name}>
                      <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                        {field.label} ({field.field_type})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductTypeRow;
