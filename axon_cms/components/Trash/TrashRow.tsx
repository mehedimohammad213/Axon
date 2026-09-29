import React from "react";
import { Button, Card, Popconfirm, Badge } from "antd";
import {
  AppstoreOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  DeleteOutlined,
  FileTextOutlined,
  FormOutlined,
  LayoutOutlined,
  LinkOutlined,
  PictureOutlined,
  RestOutlined,
  ShoppingOutlined,
  TableOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const TYPE_ICONS = {
  pages: FileTextOutlined,
  media: PictureOutlined,
  menuitems: LinkOutlined,
  navbars: AppstoreOutlined,
  cards: AppstoreOutlined,
  sliders: AppstoreOutlined,
  footers: LayoutOutlined,
  tables: TableOutlined,
  products: ShoppingOutlined,
  "product-types": ShoppingOutlined,
  form_builder: FormOutlined,
  "form-submission": FormOutlined,
  "generated-models": AppstoreOutlined,
};

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

const TrashRow = ({ item, onRestore, onDelete, busy }) => {
  const TypeIcon = TYPE_ICONS[item.type] || RestOutlined;

  const actions = [
    <Button
      key="restore"
      icon={<UndoOutlined />}
      onClick={() => onRestore(item)}
      loading={busy}
      className="headlessbutton headlessbutton-pill !mr-0"
    >
      Restore
    </Button>,
    <Popconfirm
      key="delete"
      title="Permanently delete this item?"
      description="This cannot be undone."
      onConfirm={() => onDelete(item)}
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
        loading={busy}
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
            <Badge count={`ID-${item.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={item.title || "Untitled item"}
            >
              {item.title || "Untitled item"}
            </h3>
          </div>
          <h5 className="mb-0 inline-flex shrink-0 items-center gap-1 text-sm font-bold text-gray-400">
            <TypeIcon className="text-xs" />
            {item.type_label || item.type}
          </h5>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Deleted
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {formatDate(item.deleted_at)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
              {formatDate(item.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TrashRow;
