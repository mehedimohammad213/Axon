// components/PageBuilder/PageCard.jsx

import {
  DeleteFilled,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Button, Card, Popconfirm, Badge, Tag, Drawer } from "antd";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PageEditForm from "./PageEditForm";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const PageCard = ({
  page,
  handleDeletePage,
  handleEditPageInfo,
  handleDuplicatePage,
  handlePreviewPage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState("Page");
  const [saving, setSaving] = useState(false);
  const editFormRef = useRef(null);

  useEffect(() => {
    setType(page?.type || "Unknown");
  }, [page?.type]);

  const itemLabel = type === "Footer" ? "footer" : "page";
  const entityLabel = type === "Footer" ? "Footer" : "Page";
  const additional = page.additional?.[0] || {};
  const keywords = Array.isArray(additional.keywords)
    ? additional.keywords
    : [];
  const pageTypeLabel = additional.pageType || type;
  const isActive = page.status !== false && page.status !== 0;

  const startEditing = (e) => {
    e?.stopPropagation?.();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSaving(false);
  };

  const confirmEdit = async (updatedData) => {
    try {
      setSaving(true);
      await handleEditPageInfo(updatedData);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={startEditing}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    handlePreviewPage && (
      <Button
        key="preview"
        icon={<EyeOutlined />}
        onClick={() => handlePreviewPage(page.id)}
        className="page-card-btn page-card-btn-soft !mr-0"
      >
        Preview
      </Button>
    ),
    handleDuplicatePage && (
      <Button
        key="duplicate"
        icon={<CopyOutlined />}
        onClick={() => handleDuplicatePage(page.id)}
        className="page-card-btn page-card-btn-soft !mr-0"
      >
        Duplicate
      </Button>
    ),
    <Popconfirm
      key="delete"
      title={`Move this ${itemLabel} to trash?`}
      description="You can restore it later from Trash."
      onConfirm={() => handleDeletePage(page.id)}
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
  ].filter(Boolean);

  return (
    <>
      <Card
        hoverable
        actions={actions}
        className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
      >
        <div className="flex flex-col pt-3">
          <div className="media-card-meta flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Badge count={`ID-${page.id}`} style={idBadgeStyle} />
              <h3
                className="m-0 truncate text-base font-semibold"
                title={page.page_name_en || `Untitled ${itemLabel}`}
              >
                {page.page_name_en || `Untitled ${itemLabel}`}
              </h3>
            </div>
            <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
              {pageTypeLabel}
            </h5>
          </div>

          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {page.page_name_bn || "No alternate title"}
          </p>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Builder
              </span>
              <Link href={`/page-builder/${page.id}`}>
                <a className="inline-flex min-w-0 items-center gap-1.5 truncate text-brand-dark hover:underline">
                  <LinkOutlined className="text-xs" />
                  <span className="truncate">/{page.slug || page.id}</span>
                </a>
              </Link>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Status
              </span>
              <Tag
                className={`mb-0 ${
                  isActive
                    ? "!border-[var(--theme)] !bg-[var(--theme-transparent)] !text-[var(--theme)]"
                    : "!border-gray-200 !bg-gray-50 !text-gray-500"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>

          {keywords.length > 0 && (
            <div className="mt-3 overflow-hidden whitespace-nowrap">
              {keywords.slice(0, 6).map((tagItem) => (
                <Tag key={tagItem} color="yellow" className="mb-0">
                  {tagItem}
                </Tag>
              ))}
              {keywords.length > 6 && (
                <Tag key="more" color="green" className="mb-0">
                  ...
                </Tag>
              )}
            </div>
          )}
        </div>
      </Card>

      <Drawer
        open={isEditing}
        onClose={cancelEditing}
        title={
          <div className="flex items-center gap-2">
            <img
              src={
                type === "Footer"
                  ? "/icons/headless/footer.svg"
                  : "/icons/headless/forms.svg"
              }
              alt={entityLabel}
              className="w-6"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span>Edit {entityLabel}</span>
          </div>
        }
        placement="right"
        width="min(720px, 92vw)"
        destroyOnClose
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              loading={saving}
              onClick={() => editFormRef.current?.submit()}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update {entityLabel}
            </Button>
          </div>
        }
      >
        {isEditing && (
          <PageEditForm ref={editFormRef} page={page} onSubmit={confirmEdit} />
        )}
      </Drawer>
    </>
  );
};

export default PageCard;
