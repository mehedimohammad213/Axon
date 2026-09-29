// components/Navbars/NavbarRow.js

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Modal,
  Card,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileImageFilled,
  MenuOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import instance from "../../axios";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import SortableMenuItemsPicker from "../MenuItems/SortableMenuItemsPicker";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";
import EditMenuItemForm from "../MenuItems/EditMenuItemForm";

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

const NavbarLogo = ({ logo, alt = "Navbar logo", size = 48, className = "" }) => {
  const src = getLogoUrl(logo);

  return (
    <img
      src={src}
      alt={logo?.file_name || alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={(e) => {
        if (e.currentTarget.src !== PLACEHOLDER_LOGO) {
          e.currentTarget.src = PLACEHOLDER_LOGO;
        }
      }}
    />
  );
};

const NavbarLogoPreview = ({
  logo,
  alt = "Navbar logo",
  size = 48,
  previewSize = 220,
  className = "",
}) => {
  const src = getLogoUrl(logo);

  const preview = (
    <div className="p-1">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <img
          src={src}
          alt={logo?.file_name || alt}
          className="max-h-[220px] max-w-[220px] object-contain"
          style={{ width: previewSize, height: previewSize }}
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
      <div
        className={`inline-flex cursor-zoom-in items-center justify-center transition-transform hover:scale-105 ${className}`}
      >
        <NavbarLogo logo={logo} alt={alt} size={size} />
      </div>
    </Tooltip>
  );
};

const NavbarRow = ({
  navbar,
  media,
  setNavbars,
  editingNavbarId,
  setEditingNavbarId,
  fetchNavbars,
}) => {
  const [editedNavbarTitleEn, setEditedNavbarTitleEn] = useState(
    navbar.title_en || ""
  );
  const [editedNavbarTitleBn, setEditedNavbarTitleBn] = useState(
    navbar.title_bn || ""
  );
  const [editedLogoId, setEditedLogoId] = useState(getNavbarLogoId(navbar));
  const [editedMenuItemIds, setEditedMenuItemIds] = useState(
    navbar.menu_items?.map((item) => item.id) || navbar.menu_item_ids || []
  );
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedLogoMedia, setSelectedLogoMedia] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  const isEditing = editingNavbarId === navbar.id;
  const menuItemsCount = navbar.menu_items?.length || 0;
  const navbarLogo = resolveNavbarLogo(navbar, media);

  useEffect(() => {
    if (isEditing) {
      setEditedNavbarTitleEn(navbar.title_en || "");
      setEditedNavbarTitleBn(navbar.title_bn || "");
      setEditedLogoId(getNavbarLogoId(navbar));
      setEditedMenuItemIds(
        navbar.menu_items?.map((item) => item.id) || navbar.menu_item_ids || []
      );
    }
  }, [
    isEditing,
    navbar.id,
    navbar.title_en,
    navbar.title_bn,
    navbar.logo_id,
    navbar.logo,
    navbar.menu_items,
    navbar.menu_item_ids,
  ]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await instance("/menuitems");
        if (Array.isArray(response.data)) setMenuItems(response.data);
      } catch {
        // picker will show empty
      }
    };
    const fetchPages = async () => {
      try {
        const response = await instance("/pages");
        if (Array.isArray(response.data)) setPages(response.data);
      } catch {
        // silently fail
      }
    };
    if (isEditing || editingMenuItem || isAddMenuItemOpen) {
      fetchMenuItems();
      fetchPages();
    }
  }, [isEditing, editingMenuItem, isAddMenuItemOpen, navbar.id]);

  const handleUpdate = async () => {
    const titleEn = (editedNavbarTitleEn || "").trim();
    const logoId = editedLogoId ?? getNavbarLogoId(navbar);
    if (!titleEn || !logoId) {
      message.error("Please fill in title and logo");
      return;
    }
    if (!editedMenuItemIds.length) {
      message.error("Select at least one menu item");
      return;
    }

    try {
      const updatedNavbar = {
        title_en: titleEn,
        title_bn: (editedNavbarTitleBn || "").trim(),
        logo_id: logoId,
        menu_item_ids: editedMenuItemIds,
      };
      const response = await instance.put(
        `/navbars/${navbar.id}`,
        updatedNavbar
      );
      if (response.status === 200) {
        message.success("Navbar updated successfully");
        setNavbars((prevNavbars) =>
          prevNavbars?.map((item) =>
            item.id === navbar.id ? { ...item, ...updatedNavbar } : item
          )
        );
        setEditingNavbarId(null);
        setSelectedLogoMedia(null);
        fetchNavbars();
      } else {
        message.error("Error updating navbar");
      }
    } catch {
      message.error("Error updating navbar");
    }
  };

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

  const startEditing = (e) => {
    e?.stopPropagation?.();
    setEditingNavbarId(navbar.id);
  };

  const cancelEditing = () => {
    setEditingNavbarId(null);
    setSelectedLogoMedia(null);
  };

  const closeMenuItemEditor = () => {
    setEditingMenuItem(null);
  };

  const closeAddMenuItem = () => {
    setIsAddMenuItemOpen(false);
  };

  const openMenuItemEditor = (item) => {
    if (!item?.id) return;
    const fullItem =
      menuItems.find((menuItem) => menuItem.id === item.id) || item;
    setEditingMenuItem(fullItem);
  };

  const handleMenuItemUpdated = (updated) => {
    if (!updated?.id) return;
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    setNavbars((prevNavbars) =>
      prevNavbars?.map((item) => ({
        ...item,
        menu_items: (item.menu_items || []).map((menuItem) =>
          menuItem.id === updated.id ? { ...menuItem, ...updated } : menuItem
        ),
      }))
    );
    closeMenuItemEditor();
    fetchNavbars?.();
  };

  const editLogo = selectedLogoMedia || navbarLogo;

  const editingActions = [
    <Button
      key="save"
      icon={<CheckCircleOutlined />}
      onClick={handleUpdate}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Save
    </Button>,
    <Button
      key="cancel"
      icon={<CloseCircleOutlined />}
      onClick={cancelEditing}
      className="page-card-btn page-card-btn-muted !mr-0"
    >
      Cancel
    </Button>,
  ];

  const defaultActions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={startEditing}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
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
      actions={isEditing ? editingActions : defaultActions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
      {isEditing ? (
        <div className="space-y-4 pt-3" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] md:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Logo
              </label>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-0.5">
                  <NavbarLogoPreview logo={editLogo} size={28} />
                </div>
                <Button
                  icon={<FileImageFilled />}
                  onClick={() => setMediaModalVisible(true)}
                  className="rounded-lg border-gray-200"
                >
                  Change logo
                </Button>
              </div>
              <MediaSelectionModal
                isVisible={mediaModalVisible}
                onClose={() => setMediaModalVisible(false)}
                selectionMode="single"
                onSelectMedia={(selectedMedia) => {
                  const mediaItem = Array.isArray(selectedMedia)
                    ? selectedMedia[0]
                    : selectedMedia;
                  if (!mediaItem?.id) return;
                  setEditedLogoId(mediaItem.id);
                  setSelectedLogoMedia(mediaItem);
                  setMediaModalVisible(false);
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Title (English)
              </label>
              <Input
                value={editedNavbarTitleEn}
                onChange={(e) => setEditedNavbarTitleEn(e.target.value)}
                placeholder="Title (English)"
                prefix={<MenuOutlined className="text-gray-400" />}
                allowClear
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Title (Bangla)
              </label>
              <Input
                value={editedNavbarTitleBn}
                onChange={(e) => setEditedNavbarTitleBn(e.target.value)}
                placeholder="শিরোনাম (বাংলা)"
                prefix={<GlobalOutlined className="text-gray-400" />}
                allowClear
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Menu items — select multiple and drag to order
              </label>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => setIsAddMenuItemOpen(true)}
                className="headlessbutton headlessbutton-pill !mr-0"
              >
                Add item
              </Button>
            </div>
            <SortableMenuItemsPicker
              menuItems={menuItems}
              value={editedMenuItemIds}
              onChange={setEditedMenuItemIds}
              onEdit={openMenuItemEditor}
            />
          </div>
        </div>
      ) : (
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

          <Tooltip title={navbar.title_bn || undefined} placement="topLeft">
            <p className="mt-2 truncate text-sm leading-5 text-gray-500">
              {navbar.title_bn || "No alternate title"}
            </p>
          </Tooltip>

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
                  className="m-0 inline-flex cursor-pointer items-center gap-1.5 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700 hover:border-brand hover:bg-brand-light hover:text-brand-dark"
                  onClick={(e) => {
                    e.stopPropagation();
                    openMenuItemEditor(item);
                  }}
                >
                  {item.title}
                  <EditOutlined className="text-[10px]" />
                </Tag>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={Boolean(editingMenuItem)}
        onCancel={closeMenuItemEditor}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Edit Menu Item</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {editingMenuItem && (
          <EditMenuItemForm
            menuItem={editingMenuItem}
            pages={pages}
            menuItems={menuItems}
            onCancel={closeMenuItemEditor}
            onUpdated={handleMenuItemUpdated}
          />
        )}
      </Modal>

      <Modal
        open={isAddMenuItemOpen}
        onCancel={closeAddMenuItem}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Add Menu Item</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {isAddMenuItemOpen && (
          <AddMenuItemForm
            pages={pages}
            menuItems={menuItems}
            onCancel={closeAddMenuItem}
            fetchMenuItems={async () => {
              const response = await instance("/menuitems");
              if (Array.isArray(response.data)) {
                setMenuItems(response.data);
              }
            }}
            onMenuItemCreated={(createdItems = []) => {
              const ids = createdItems.map((item) => item.id).filter(Boolean);
              if (ids.length) {
                setEditedMenuItemIds((prev) => [
                  ...prev,
                  ...ids.filter((id) => !prev.includes(id)),
                ]);
              }
            }}
          />
        )}
      </Modal>
    </Card>
  );
};

export default NavbarRow;
