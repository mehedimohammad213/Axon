import React from "react";
import { Button, Card, Popconfirm, Tooltip, Badge, Tag } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { parseFieldSchema } from "./productUtils";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const isInactive = (status) => status === false || status === 0;

const ProductTypeRow = ({ productType, onUploadProduct, onDelete }) => {
  const router = useRouter();
  const fields = parseFieldSchema(productType.field_schema);
  const inactive = isInactive(productType.status);

  const actions = [
    <Button
      key="upload"
      icon={<PlusCircleOutlined />}
      onClick={() => onUploadProduct?.(productType)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Upload
    </Button>,
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => router.push(`/products/edit-type?id=${productType.id}`)}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Edit
    </Button>,
    <Popconfirm
      key="delete"
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
        className="headlesscancelbutton headlessbutton-pill !mr-0"
        icon={<DeleteOutlined />}
      >
        Delete
      </Button>
    </Popconfirm>,
  ];

  return (
    <Card
      hoverable
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      <div className="flex flex-col pt-3">
        <div className="media-card-meta flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge count={`ID-${productType.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={productType.name || "Untitled product type"}
            >
              {productType.name || "Untitled product type"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Product type
          </h5>
        </div>

        <Tooltip
          title={productType.description || productType.slug || undefined}
          placement="topLeft"
        >
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {productType.description || productType.slug || "No description"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </span>
            <Tag className="mb-0 border-gray-200 bg-gray-50 text-gray-700">
              {inactive ? "Inactive" : "Active"}
            </Tag>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Fields
            </span>
            <span className="text-sm font-medium text-gray-800">
              {fields.length} field{fields.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {fields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((field) => (
              <Tag
                key={field.id || field.name}
                className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {field.label}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductTypeRow;
