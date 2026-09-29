import React from "react";
import { Drawer, Tag } from "antd";
import { LinkOutlined } from "@ant-design/icons";

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

const MenuItemViewDrawer = ({ open, menuItem, allMenuItems = [], onClose }) => {
  if (!menuItem) return null;

  const parent = allMenuItems.find(
    (item) => item.id === parseInt(menuItem.parent_id, 10)
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/menuitems.svg"
            alt="Menu"
            className="w-6"
          />
          <span>Menu Details</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width="min(720px, 92vw)"
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
    >
      <div className="space-y-4">
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
              #{menuItem.id}
            </span>
            <Tag color="blue">Menu</Tag>
          </div>
          <h2 className="mb-0 mt-3 text-xl font-semibold text-gray-900">
            {menuItem.title || "Untitled item"}
          </h2>
          {menuItem.title_bn && (
            <p className="mb-0 mt-1 text-sm text-gray-500">{menuItem.title_bn}</p>
          )}
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Title (EN)">{menuItem.title || "—"}</InfoRow>
            <InfoRow label="Title (BN)">{menuItem.title_bn || "—"}</InfoRow>
            <InfoRow label="Parent">{parent?.title || "No parent"}</InfoRow>
            <InfoRow label="Link">
              {menuItem.link ? (
                <a
                  href={menuItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-dark hover:underline"
                >
                  <LinkOutlined />
                  <span className="break-all">{menuItem.link}</span>
                </a>
              ) : (
                "—"
              )}
            </InfoRow>
          </dl>
        </div>
      </div>
    </Drawer>
  );
};

export default MenuItemViewDrawer;
