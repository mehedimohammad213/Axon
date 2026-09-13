import React, { useMemo } from "react";
import { Button, Image, Popconfirm, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getFieldDisplayValue, getListFields } from "./productUtils";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const ProductsList = ({
  products,
  productTypes,
  onEdit,
  onDelete,
}) => {
  const typeById = useMemo(() => {
    const map = new Map();
    productTypes.forEach((type) => map.set(String(type.id), type));
    return map;
  }, [productTypes]);

  const dynamicColumns = useMemo(() => {
    const allFields = [];
    const seen = new Set();
    productTypes.forEach((type) => {
      getListFields(type).forEach((field) => {
        if (!seen.has(field.name)) {
          seen.add(field.name);
          allFields.push(field);
        }
      });
    });
    return allFields.slice(0, 4).map((field) => ({
      title: field.label || field.name,
      key: `field_${field.name}`,
      ellipsis: true,
      render: (_, record) => getFieldDisplayValue(record, field.name),
    }));
  }, [productTypes]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => <Tag>{id}</Tag>,
    },
    {
      title: "Product",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="flex items-center gap-3">
          {record.media_files?.file_path ? (
            <Image
              src={resolveMediaUrl(record.media_files.file_path)}
              alt={title}
              width={48}
              height={36}
              className="rounded object-cover"
              preview={false}
            />
          ) : (
            <div className="flex h-9 w-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
              N/A
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">
              {title || "Untitled Product"}
            </div>
            {record.slug && (
              <div className="text-xs text-gray-500">{record.slug}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      key: "product_type",
      width: 160,
      render: (_, record) => {
        const type =
          record.product_type ||
          typeById.get(String(record.product_type_id));
        return <Tag color="blue">{type?.name || "Unknown"}</Tag>;
      },
    },
    ...dynamicColumns,
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) =>
        status === false || status === 0 ? (
          <Tag color="default">Inactive</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button icon={<EditOutlined />} onClick={() => onEdit?.(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            description="This cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete?.(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        pagination={false}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default ProductsList;
