// components/Navbars/NavbarRow.js

import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Modal,
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  CloseCircleOutlined,
  FileImageFilled,
  MenuOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  PlusCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import instance from "../../axios";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import SortableMenuItemsPicker from "../Menus/SortableMenuItemsPicker";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";

const PLACEHOLDER_LOGO = "/images/headless_logo.svg";

const resolveNavbarLogo = (navbar, mediaList = []) => {
  if (navbar?.logo?.file_path) return navbar.logo;
  const logoId = navbar?.logo_id ?? navbar?.logo?.id;
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

const NavbarRow = ({
  navbar,
  menus,
  media,
  setNavbars,
  editingNavbarId,
  setEditingNavbarId,
  fetchNavbars,
  expandedNavbarId,
  handleExpand,
}) => {
  const [editedNavbarTitleEn, setEditedNavbarTitleEn] = useState(
    navbar.title_en
  );
  const [editedNavbarTitleBn, setEditedNavbarTitleBn] = useState(
    navbar.title_bn
  );
  const [editedLogoId, setEditedLogoId] = useState(navbar?.logo?.id || null);
  const [editedMenuId, setEditedMenuId] = useState(navbar?.menu?.id || null);
  const [editedMenuItemIds, setEditedMenuItemIds] = useState(
    navbar.menu?.menu_items?.map((item) => item.id) || []
  );
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedLogoMedia, setSelectedLogoMedia] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);

  const isEditing = editingNavbarId === navbar.id;
  const isExpanded = expandedNavbarId === navbar.id;
  const menuItemsCount = navbar.menu?.menu_items?.length || 0;
  const navbarLogo = resolveNavbarLogo(navbar, media);

  const findMenuById = (menuId, menusList = menus) =>
    menusList.find((menu) => String(menu.id) === String(menuId));

  const resolveMenuForUpdate = async (menuId) => {
    let menu = findMenuById(menuId) || navbar.menu;
    if (menu?.name) return menu;

    const response = await instance("/menus");
    const freshMenus = Array.isArray(response.data) ? response.data : [];
    return freshMenus.find((item) => String(item.id) === String(menuId));
  };

  useEffect(() => {
    if (isEditing) {
      setEditedNavbarTitleEn(navbar.title_en);
      setEditedNavbarTitleBn(navbar.title_bn);
      setEditedLogoId(navbar?.logo?.id || null);
      setEditedMenuId(navbar?.menu?.id || null);
      setEditedMenuItemIds(
        navbar.menu?.menu_items?.map((item) => item.id) || []
      );
    }
  }, [isEditing, navbar]);

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
    if (isEditing) {
      fetchMenuItems();
      fetchPages();
    }
  }, [isEditing, navbar.id]);

  useEffect(() => {
    if (!editedMenuId) {
      setEditedMenuItemIds([]);
      return;
    }
    const selectedMenu = findMenuById(editedMenuId);
    if (selectedMenu?.menu_items?.length) {
      setEditedMenuItemIds(selectedMenu.menu_items.map((item) => item.id));
    } else if (selectedMenu?.menu_item_ids) {
      setEditedMenuItemIds(selectedMenu.menu_item_ids);
    } else {
      setEditedMenuItemIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedMenuId]);

  const handleUpdate = async () => {
    try {
      const updatedNavbar = {
        title_en: editedNavbarTitleEn,
        title_bn: editedNavbarTitleBn,
        logo_id: editedLogoId,
        menu_id: editedMenuId,
      };
      const response = await instance.put(
        `/navbars/${navbar.id}`,
        updatedNavbar
      );
      if (response.status === 200) {
        if (editedMenuId) {
          const menu = await resolveMenuForUpdate(editedMenuId);
          if (!menu?.name) {
            message.error(
              "Selected menu could not be found. Please re-select the menu."
            );
            return;
          }
          await instance.put(`/menus/${editedMenuId}`, {
            name: menu.name,
            menu_item_ids: editedMenuItemIds,
          });
        }
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
    if (!isExpanded) handleExpand(navbar.id);
  };

  const cancelEditing = () => {
    setEditingNavbarId(null);
    setSelectedLogoMedia(null);
  };

  const editLogo = selectedLogoMedia || navbarLogo;

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
        onClick={() => handleExpand(navbar.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(navbar.id);
          }
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            isExpanded
              ? "border-brand/30 bg-brand-light text-brand-dark"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleExpand(navbar.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <NavbarLogoPreview logo={navbarLogo} size={40} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{navbar.id}
            </span>
            {navbar?.menu?.name && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                <MenuOutlined className="text-[10px]" />
                {navbar.menu.name}
              </span>
            )}
            {menuItemsCount > 0 && (
              <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                {menuItemsCount} item{menuItemsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {navbar.title_en || "Untitled navbar"}
          </h3>

          {navbar.title_bn && (
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {navbar.title_bn}
            </p>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit navbar">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={startEditing}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-brand-light hover:text-brand-dark"
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                        Title (English)
                      </label>
                      <Input
                        value={editedNavbarTitleEn}
                        onChange={(e) =>
                          setEditedNavbarTitleEn(e.target.value)
                        }
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
                        onChange={(e) =>
                          setEditedNavbarTitleBn(e.target.value)
                        }
                        placeholder="শিরোনাম (বাংলা)"
                        prefix={<GlobalOutlined className="text-gray-400" />}
                        allowClear
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                      Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <NavbarLogoPreview logo={editLogo} size={56} />
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
                        setEditedLogoId(selectedMedia.id);
                        setSelectedLogoMedia(selectedMedia);
                        setMediaModalVisible(false);
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                      Assigned menu
                    </label>
                    <Select
                      showSearch
                      placeholder="Select a menu"
                      optionFilterProp="children"
                      value={editedMenuId}
                      onChange={(value) => setEditedMenuId(value)}
                      className="w-full max-w-md"
                      allowClear
                    >
                      {menus?.map((menu) => (
                        <Select.Option key={menu.id} value={menu.id}>
                          {menu.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  {editedMenuId && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Menu items — drag to order
                        </label>
                        <Button
                          icon={<PlusCircleOutlined />}
                          onClick={() => setIsAddMenuItemOpen(true)}
                          size="small"
                          className="rounded-lg border-brand text-brand-dark hover:border-brand-dark"
                        >
                          Add item
                        </Button>
                      </div>
                      <SortableMenuItemsPicker
                        menuItems={menuItems}
                        value={editedMenuItemIds}
                        onChange={setEditedMenuItemIds}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-[1fr_80px]">
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <InfoRow label="Title (English)">
                        {navbar.title_en || "—"}
                      </InfoRow>
                      <InfoRow label="Title (Bangla)">
                        {navbar.title_bn || "—"}
                      </InfoRow>
                      <InfoRow label="Assigned menu">
                        {navbar?.menu?.name || "No menu assigned"}
                      </InfoRow>
                      <InfoRow label="Menu items">
                        {menuItemsCount > 0
                          ? `${menuItemsCount} item${menuItemsCount !== 1 ? "s" : ""}`
                          : "No items"}
                      </InfoRow>
                    </dl>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Logo
                      </span>
                      <div
                        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <NavbarLogoPreview logo={navbarLogo} size={56} />
                      </div>
                    </div>
                  </div>

                  {menuItemsCount > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MenuOutlined className="text-sm text-brand-dark" />
                        <h4 className="text-sm font-semibold text-gray-800">
                          Menu items
                        </h4>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {navbar.menu.menu_items.map((item) => (
                          <li key={item.id}>
                            <Tag className="m-0 rounded-md border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                              {item.title}
                            </Tag>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={handleUpdate}
                    className="!mr-0 h-9 rounded-lg border-0 bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
                  >
                    Save changes
                  </Button>
                  <Button
                    icon={<CloseCircleOutlined />}
                    onClick={cancelEditing}
                    className="headlesscancelbutton !mr-0"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={startEditing}
                    className="!mr-0 h-9 rounded-lg border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this navbar?"
                    description="This cannot be undone."
                    onConfirm={handleDelete}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={isAddMenuItemOpen}
        onCancel={() => setIsAddMenuItemOpen(false)}
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
            onCancel={() => setIsAddMenuItemOpen(false)}
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
