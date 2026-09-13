import React, { useMemo } from "react";
import { Button, Drawer, Image, Tag } from "antd";
import { EditOutlined, ShoppingOutlined } from "@ant-design/icons";
import {
  getFieldDisplayValue,
  parseFieldSchema,
} from "./productUtils";
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

const ProductViewDrawer = ({
  open,
  product,
  productType,
  onClose,
  onEdit,
}) => {
  const fields = useMemo(
    () =>
      parseFieldSchema(
        productType?.field_schema || product?.product_type?.field_schema
      ),
    [product, productType]
  );

  const gallery = useMemo(() => {
    if (Array.isArray(product?.media) && product.media.length) {
      return product.media;
    }
    if (product?.media_files?.file_path) {
      return [product.media_files];
    }
    return [];
  }, [product]);

  if (!product) return null;

  const inactive = isInactive(product.status);
  const typeName =
    product.product_type?.name || productType?.name || "Unknown type";

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ShoppingOutlined className="text-brand-dark" />
          <span>Product View</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width="min(720px, 92vw)"
      extra={
        onEdit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(product);
              onClose?.();
            }}
            className="bg-brand hover:bg-brand-dark"
          >
            Edit Product
          </Button>
        )
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {gallery[0]?.file_path ? (
              <Image
                src={resolveMediaUrl(gallery[0].file_path)}
                alt={product.title || "Product"}
                width={112}
                height={112}
                className="h-28 w-28 object-cover"
              />
            ) : (
              <ShoppingOutlined className="text-3xl text-gray-300" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                #{product.id}
              </span>
              <Tag color={inactive ? "default" : "green"}>
                {inactive ? "Inactive" : "Active"}
              </Tag>
              <Tag color="blue">{typeName}</Tag>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {product.title || "Untitled product"}
            </h2>
            {product.slug && (
              <p className="text-sm text-gray-500">{product.slug}</p>
            )}
          </div>
        </div>

        {product.description && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {product.description}
            </p>
          </div>
        )}

        {gallery.length > 1 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              Gallery
            </p>
            <div className="flex flex-wrap gap-2">
              {gallery.map((media) => (
                <Image
                  key={media.id || media.file_path}
                  src={resolveMediaUrl(media.file_path)}
                  alt={media.file_name || product.title || "Media"}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="mb-4 text-sm font-semibold text-gray-800">Details</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Title">{product.title || "—"}</InfoRow>
            <InfoRow label="Slug">{product.slug || "—"}</InfoRow>
            <InfoRow label="Product type">{typeName}</InfoRow>
            <InfoRow label="Status">
              {inactive ? "Inactive" : "Active"}
            </InfoRow>
            {fields.map((field) => (
              <InfoRow key={field.name} label={field.label || field.name}>
                {getFieldDisplayValue(product, field.name)}
              </InfoRow>
            ))}
          </dl>
        </div>
      </div>
    </Drawer>
  );
};

export default ProductViewDrawer;
