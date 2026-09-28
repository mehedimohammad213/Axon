import React from "react";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import {
  AppstoreOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleOutlined,
  DeleteFilled,
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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

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

const TrashRow = ({
  item,
  expandedItemId,
  handleExpand,
  onRestore,
  onDelete,
  busy,
}) => {
  const isExpanded = expandedItemId === `${item.type}-${item.id}`;
  const TypeIcon = TYPE_ICONS[item.type] || RestOutlined;

  const toggleCard = () => {
    handleExpand(`${item.type}-${item.id}`);
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
            handleExpand(`${item.type}-${item.id}`);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <TypeIcon className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{item.id}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              {item.type_label}
            </span>
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={item.title || "Untitled item"}
          >
            {item.title || "Untitled item"}
          </h3>

          <Tooltip title={formatDate(item.deleted_at)} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              Deleted {formatDate(item.deleted_at)}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon={<UndoOutlined />}
            onClick={() => onRestore(item)}
            loading={busy}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Restore
          </Button>
          <Popconfirm
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
              icon={<DeleteFilled />}
              loading={busy}
              className="headlesscancelbutton headlessbutton-pill !mr-0"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4" onClick={(e) => e.stopPropagation()}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Title">{item.title || "—"}</InfoRow>
              <InfoRow label="Type">{item.type_label || item.type}</InfoRow>
              <InfoRow label="ID">#{item.id}</InfoRow>
              <InfoRow label="Deleted">{formatDate(item.deleted_at)}</InfoRow>
              <InfoRow label="Created">{formatDate(item.created_at)}</InfoRow>
              <InfoRow label="Updated">{formatDate(item.updated_at)}</InfoRow>
            </dl>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TrashRow;
