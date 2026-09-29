import React from "react";
import { Drawer, Tag } from "antd";

const PLACEHOLDER_LOGO = "/images/headless_logo.svg";

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

const getLogoUrl = (logo) => {
  if (!logo?.file_path) return PLACEHOLDER_LOGO;
  const base = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/+$/, "");
  const path = String(logo.file_path).replace(/^\/+/, "");
  return `${base}/${path}`;
};

const NavbarViewDrawer = ({ open, navbar, media = [], onClose }) => {
  if (!navbar) return null;

  const logo =
    navbar.logo ||
    media.find(
      (item) =>
        String(item.id) === String(navbar.logo_id ?? navbar.logo?.id)
    ) ||
    null;
  const menuItems = navbar.menu_items || [];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img src="/icons/headless/navbar.svg" alt="Navbar" className="w-6" />
          <span>Navbar Details</span>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
              <img
                src={getLogoUrl(logo)}
                alt={logo?.file_name || "Navbar logo"}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== PLACEHOLDER_LOGO) {
                    e.currentTarget.src = PLACEHOLDER_LOGO;
                  }
                }}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                  #{navbar.id}
                </span>
                <Tag color="blue">Navbar</Tag>
              </div>
              <h2 className="mb-0 text-xl font-semibold text-gray-900">
                {navbar.title_en || "Untitled navbar"}
              </h2>
              {navbar.title_bn && (
                <p className="mb-0 text-sm text-gray-500">{navbar.title_bn}</p>
              )}
            </div>
          </div>
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
            <InfoRow label="Title (EN)">{navbar.title_en || "—"}</InfoRow>
            <InfoRow label="Title (BN)">{navbar.title_bn || "—"}</InfoRow>
            <InfoRow label="Menu items">
              {menuItems.length
                ? `${menuItems.length} item${menuItems.length !== 1 ? "s" : ""}`
                : "No items"}
            </InfoRow>
            <InfoRow label="Logo">{logo?.file_name || "—"}</InfoRow>
          </dl>
        </div>

        {menuItems.length > 0 && (
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
            }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
              Menu items
            </p>
            <div className="flex flex-wrap gap-2">
              {menuItems.map((item) => (
                <Tag
                  key={item.id}
                  className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
                >
                  {item.title}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default NavbarViewDrawer;
