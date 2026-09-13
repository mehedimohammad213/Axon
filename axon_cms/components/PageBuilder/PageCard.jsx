// components/PageBuilder/PageCard.jsx

import {
  DeleteFilled,
  EditOutlined,
  CopyOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LayoutOutlined,
  GlobalOutlined,
  BookOutlined,
  MenuOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Button, Card, Popconfirm, Tooltip, Tag } from "antd";
import React, { useState, useEffect } from "react";
import PageInfoDisplay from "./PageInfoDisplay";
import PageEditForm from "./PageEditForm";

const TYPE_CONFIG = {
  Event: { icon: <CalendarOutlined />, color: "#1890ff", bgColor: "#e6f7ff" },
  Blog: { icon: <FileTextOutlined />, color: "#52c41a", bgColor: "#f6ffed" },
  Footer: { icon: <LayoutOutlined />, color: "#13c2c2", bgColor: "#e6fffb" },
  Page: { icon: <GlobalOutlined />, color: "var(--theme)", bgColor: "var(--theme-transparent)" },
  Subpage: { icon: <BookOutlined />, color: "#595959", bgColor: "#f5f5f5" },
  Unknown: { icon: <FileTextOutlined />, color: "#8c8c8c", bgColor: "#f5f5f5" },
};

const ACTION_BUTTONS = [
  {
    key: "preview",
    icon: <EyeOutlined />,
    text: "Preview",
  },
  {
    key: "edit",
    icon: <EditOutlined />,
    text: "Edit info",
  },
  {
    key: "duplicate",
    icon: <CopyOutlined />,
    text: "Duplicate",
  },
];

const PageCard = ({
  page,
  linkedMenuItems = [],
  handleExpand,
  expandedPageId,
  handleDeletePage,
  handleEditPageInfo,
  handleDuplicatePage,
  handlePreviewPage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState("Page");

  useEffect(() => {
    setType(page?.type || "Unknown");
  }, [page?.type]);

  const isExpanded = expandedPageId === page.id;
  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.Unknown;
  const truncateText = (text, maxLength = 25) =>
    text?.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text || "";

  const handleAction = (action) => {
    switch (action) {
      case "preview":
        handlePreviewPage(page.id);
        break;
      case "edit":
        setIsEditing(true);
        break;
      case "duplicate":
        handleDuplicatePage(page.id);
        break;
      default:
        break;
    }
  };

  const confirmEdit = (updatedData) => {
    handleEditPageInfo(updatedData);
    setIsEditing(false);
  };

  return (
    <Card
      className={`w-full overflow-hidden rounded-xl border transition-shadow duration-200 ${
        isExpanded
          ? "border-brand/40 shadow-md"
          : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
      }`}
      bodyStyle={{ padding: 0 }}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-start gap-3 px-5 py-4 sm:items-center"
        onClick={() => handleExpand(page.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(page.id);
          }
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse page details" : "Expand page details"}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isExpanded
              ? "border-brand/30 bg-brand-light text-brand-dark"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleExpand(page.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: typeConfig.bgColor,
                color: typeConfig.color,
              }}
            >
              {typeConfig.icon}
              {type}
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{page.id}
            </span>
            {linkedMenuItems.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                <MenuOutlined className="text-[10px]" />
                {linkedMenuItems.length} menu
                {linkedMenuItems.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {page.page_name_en || "Untitled page"}
          </h3>

          {page.slug && (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-gray-500">
              <LinkOutlined className="shrink-0 text-xs" />
              <span>/{page.slug}</span>
            </p>
          )}

          {linkedMenuItems.length > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {linkedMenuItems.slice(0, 3).map((item) => (
                <Tooltip
                  key={item.id}
                  title={item.link || "No link"}
                  placement="top"
                >
                  <Tag
                    icon={<MenuOutlined />}
                    className="m-0 inline-flex items-center rounded-md border-teal-100 bg-teal-50 px-2 py-0.5 text-xs text-teal-700"
                  >
                    {truncateText(item.title, 20)}
                  </Tag>
                </Tooltip>
              ))}
              {linkedMenuItems.length > 3 && (
                <Tag className="m-0 rounded-md border-gray-200 bg-gray-50 text-xs text-gray-500">
                  +{linkedMenuItems.length - 3} more
                </Tag>
              )}
            </div>
          )}
        </div>

        <div
          className="flex shrink-0 items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Preview page">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewPage(page.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
            />
          </Tooltip>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              {isEditing ? (
                <PageEditForm
                  page={page}
                  onSubmit={confirmEdit}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <PageInfoDisplay
                  page={page}
                  linkedMenuItems={linkedMenuItems}
                />
              )}
            </div>

            {!isEditing && (
              <div className="flex flex-wrap items-center gap-2">
                {ACTION_BUTTONS.map(({ key, icon, text }) => (
                  <Button
                    key={key}
                    icon={icon}
                    onClick={() => handleAction(key)}
                    className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
                  >
                    {text}
                  </Button>
                ))}

                <Popconfirm
                  title="Delete this page?"
                  description="This cannot be undone."
                  onConfirm={() => handleDeletePage(page.id)}
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
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PageCard;
