import React, { useMemo } from "react";
import { Button, Card, Image, Popconfirm, Tooltip, Badge, Tag } from "antd";
import {
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getFieldDisplayValue, getListFields } from "./productUtils";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const isInactive = (status) => status === false || status === 0;

const ProductRow = ({ product, productType, onView, onEdit, onDelete }) => {
  const inactive = isInactive(product.status);
  const listFields = useMemo(
    () => getListFields(productType).slice(0, 6),
    [productType]
  );
  const thumbnail = product.media_files?.file_path
    ? resolveMediaUrl(product.media_files.file_path)
    : null;
  const typeName = product.product_type?.name || productType?.name || "";

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit?.(product)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView?.(product)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
    </Button>,
    <Popconfirm
      key="delete"
      title="Move this product to trash?"
      description="You can restore it later from Trash."
      onConfirm={() => onDelete?.(product.id)}
      okText="Move to trash"
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
        className="page-card-btn page-card-btn-danger !mr-0"
        icon={<DeleteOutlined />}
      >
        Trash
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
            <Badge count={`ID-${product.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={product.title || "Untitled product"}
            >
              {product.title || "Untitled product"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            {typeName || "Product"}
          </h5>
        </div>

        <Tooltip title={product.slug || undefined} placement="topLeft">
          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {product.slug || "No slug"}
          </p>
        </Tooltip>

        <div className="mt-3 space-y-2 text-sm">
          {thumbnail && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Image
              </span>
              <Image
                src={thumbnail}
                alt={product.title || "Product"}
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover"
                preview={false}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </span>
            <Tag className="mb-0 border-gray-200 bg-gray-50 text-gray-700">
              {inactive ? "Inactive" : "Active"}
            </Tag>
          </div>
          {listFields.map((field) => (
            <div
              key={field.name}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {field.label || field.name}
              </span>
              <span className="truncate text-sm font-medium text-gray-800">
                {getFieldDisplayValue(product, field.name)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProductRow;
