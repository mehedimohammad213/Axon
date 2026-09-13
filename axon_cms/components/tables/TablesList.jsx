import React from "react";
import { Button, Popconfirm, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { getTableStats } from "./tableUtils";

const TablesList = ({
  tables,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => <Tag>{id}</Tag>,
    },
    {
      title: "Title",
      dataIndex: "title_en",
      key: "title_en",
      render: (title, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {title || "Untitled Table"}
          </div>
          {record.page_name && (
            <div className="text-xs text-gray-500">{record.page_name}</div>
          )}
        </div>
      ),
    },
    {
      title: "Columns",
      key: "columns",
      width: 110,
      render: (_, record) => {
        const { columnCount } = getTableStats(record);
        return <Tag color="blue">{columnCount}</Tag>;
      },
    },
    {
      title: "Rows",
      key: "rows",
      width: 100,
      render: (_, record) => {
        const { rowCount } = getTableStats(record);
        return <Tag>{rowCount}</Tag>;
      },
    },
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
      width: 220,
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button icon={<EyeOutlined />} onClick={() => onPreview?.(record)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => onEdit?.(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this table?"
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
        dataSource={tables}
        pagination={false}
      />
    </div>
  );
};

export default TablesList;
