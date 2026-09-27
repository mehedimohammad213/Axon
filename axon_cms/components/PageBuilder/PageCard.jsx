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
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Popconfirm, Tooltip } from "antd";
import React, { useState, useEffect, useRef } from "react";
import PageInfoDisplay from "./PageInfoDisplay";
import PageEditForm from "./PageEditForm";

const TYPE_CONFIG = {
  Event: { icon: <CalendarOutlined />, color: "#1890ff", bgColor: "#e6f7ff" },
  Blog: { icon: <FileTextOutlined />, color: "#52c41a", bgColor: "#f6ffed" },
  Footer: {
    icon: <LayoutOutlined />,
    color: "var(--theme)",
    bgColor: "var(--theme-transparent)",
  },
  Page: {
    icon: <GlobalOutlined />,
    color: "var(--theme)",
    bgColor: "var(--theme-transparent)",
  },
  Subpage: { icon: <BookOutlined />, color: "#595959", bgColor: "#f5f5f5" },
  Unknown: { icon: <FileTextOutlined />, color: "#8c8c8c", bgColor: "#f5f5f5" },
};

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
  const editFormRef = useRef(null);

  useEffect(() => {
    setType(page?.type || "Unknown");
  }, [page?.type]);

  const isExpanded = expandedPageId === page.id;
  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.Unknown;
  const itemLabel = type === "Footer" ? "footer" : "page";

  const startEditing = (e) => {
    e?.stopPropagation?.();
    setIsEditing(true);
    if (!isExpanded) handleExpand(page.id);
  };

  const cancelEditing = (e) => {
    e?.stopPropagation?.();
    setIsEditing(false);
  };

  const confirmEdit = (updatedData) => {
    handleEditPageInfo(updatedData);
    setIsEditing(false);
  };

  const toggleCard = () => {
    if (isEditing) return;
    handleExpand(page.id);
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
                <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                  {linkedMenuItems.length} menu
                  {linkedMenuItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <h3
              className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
              title={page.page_name_en || `Untitled ${itemLabel}`}
            >
              {page.page_name_en || `Untitled ${itemLabel}`}
            </h3>

            <Tooltip title={page.page_name_bn || undefined} placement="topLeft">
              <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
                {page.page_name_bn || "\u00A0"}
              </p>
            </Tooltip>
          </div>

          <div
            className="flex shrink-0 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={() => editFormRef.current?.submit()}
                  className="headlessbutton headlessbutton-pill !mr-0"
                >
                  Save changes
                </Button>
                <Button
                  icon={<CloseCircleOutlined />}
                  onClick={cancelEditing}
                  className="headlesscancelbutton headlessbutton-pill !mr-0"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex w-[8.5rem] flex-col gap-2">
                  {handlePreviewPage && (
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => handlePreviewPage(page.id)}
                      className="headlessbutton headlessbutton-pill !mr-0 w-full"
                    >
                      Preview
                    </Button>
                  )}
                  <Button
                    icon={<EditOutlined />}
                    onClick={startEditing}
                    className="headlessbutton headlessbutton-pill !mr-0 w-full"
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex w-[8.5rem] flex-col gap-2">
                  {handleDuplicatePage && (
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => handleDuplicatePage(page.id)}
                      className="headlessbutton headlessbutton-pill !mr-0 w-full"
                    >
                      Duplicate
                    </Button>
                  )}
                  <Popconfirm
                    title={`Delete this ${itemLabel}?`}
                    description="This cannot be undone."
                    onConfirm={() => handleDeletePage(page.id)}
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
                      className="headlesscancelbutton headlessbutton-pill !mr-0 w-full"
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </div>
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5">
            {isEditing ? (
              <div className="pt-4" onClick={(e) => e.stopPropagation()}>
                <PageEditForm
                  ref={editFormRef}
                  page={page}
                  onSubmit={confirmEdit}
                />
              </div>
            ) : (
              <div
                className="space-y-5 pt-4"
                onClick={(e) => e.stopPropagation()}
              >
                <PageInfoDisplay
                  page={page}
                  linkedMenuItems={linkedMenuItems}
                />
              </div>
            )}
          </div>
        )}
    </Card>
  );
};

export default PageCard;
