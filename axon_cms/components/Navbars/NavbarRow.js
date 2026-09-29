// components/Navbars/NavbarRow.js

import React from "react";
import {
  Button,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Card,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  DeleteOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import instance from "../../axios";

const PLACEHOLDER_LOGO = "/images/headless_logo.svg";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const getNavbarLogoId = (navbar) =>
  navbar?.logo_id ?? navbar?.logo?.id ?? null;

const resolveNavbarLogo = (navbar, mediaList = []) => {
  if (navbar?.logo?.file_path) return navbar.logo;
  const logoId = getNavbarLogoId(navbar);
  if (logoId && Array.isArray(mediaList)) {
    return mediaList.find((item) => String(item.id) === String(logoId)) || null;
  }
  return null;
};

const getLogoUrl = (logo) => {
  if (!logo?.file_path) return PLACEHOLDER_LOGO;
  const base = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/+$/, "");
  const path = String(logo.file_path).replace(/^\/+/, "");
  return `${base}/${path}`;
};

const NavbarLogoPreview = ({ logo, size = 28 }) => {
  const src = getLogoUrl(logo);
  const preview = (
    <div className="p-1">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <img
          src={src}
          alt={logo?.file_name || "Navbar logo"}
          className="max-h-[220px] max-w-[220px] object-contain"
          style={{ width: 220, height: 220 }}
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER_LOGO) {
              e.currentTarget.src = PLACEHOLDER_LOGO;
            }
          }}
        />
      </div>
      {logo?.file_name && (
        <p className="mt-2 max-w-[220px] truncate text-center text-xs text-gray-500">
          {logo.file_name}
        </p>
      )}
    </div>
  );

  return (
    <Tooltip
      title={preview}
      placement="rightTop"
      color="#ffffff"
      overlayInnerStyle={{ padding: 4 }}
      mouseEnterDelay={0.15}
    >
      <div className="inline-flex cursor-zoom-in items-center justify-center transition-transform hover:scale-105">
        <img
          src={src}
          alt={logo?.file_name || "Navbar logo"}
          width={size}
          height={size}
          className="object-contain"
          onError={(e) => {
            if (e.currentTarget.src !== PLACEHOLDER_LOGO) {
              e.currentTarget.src = PLACEHOLDER_LOGO;
            }
          }}
        />
      </div>
    </Tooltip>
  );
};

const NavbarRow = ({ navbar, media, setNavbars, onView, onEdit }) => {
  const menuItemsCount = navbar.menu_items?.length || 0;
  const navbarLogo = resolveNavbarLogo(navbar, media);

  const handleDelete = async () => {
    try {
      const response = await instance.delete(`/navbars/${navbar.id}`);
      if (response.status === 200) {
        message.success("Navbar deleted successfully");
        setNavbars((prevNavbars) =>
          prevNavbars.filter((item) => item.id !== navbar.id)
        );
      } else {
        message.error("Error deleting navbar");
      }
    } catch {
      message.error("Error deleting navbar");
    }
  };

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit?.(navbar)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView?.(navbar)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
    </Button>,
    <Popconfirm
      key="delete"
      title="Move this navbar to trash?"
      description="You can restore it later from Trash."
      onConfirm={handleDelete}
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
            <Badge count={`ID-${navbar.id}`} style={idBadgeStyle} />
            <h3
              className="m-0 truncate text-base font-semibold"
              title={navbar.title_en || "Untitled navbar"}
            >
              {navbar.title_en || "Untitled navbar"}
            </h3>
          </div>
          <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
            Navbar
          </h5>
        </div>

        <p className="mt-2 truncate text-sm leading-5 text-gray-500">
          {navbar.title_bn || "No alternate title"}
        </p>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Logo
            </span>
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-0.5">
              <NavbarLogoPreview logo={navbarLogo} size={28} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Menu items
            </span>
            <span className="text-sm font-medium text-gray-800">
              {menuItemsCount > 0
                ? `${menuItemsCount} item${menuItemsCount !== 1 ? "s" : ""}`
                : "No items"}
            </span>
          </div>
        </div>

        {menuItemsCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {(navbar.menu_items || []).map((item) => (
              <Tag
                key={item.id}
                className="m-0 inline-flex items-center gap-1.5 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700"
              >
                {item.title}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default NavbarRow;
