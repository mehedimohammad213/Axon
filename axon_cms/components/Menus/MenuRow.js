// components/Menus/MenuRow.js

import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  CloseCircleOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import instance from "../../axios";
import SortableMenuItemsPicker from "./SortableMenuItemsPicker";

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

const parseMenuItemIds = (menuItemIds) => {
  if (Array.isArray(menuItemIds)) return menuItemIds;

  if (typeof menuItemIds === "string") {
    try {
      const parsed = JSON.parse(menuItemIds);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeMenuItemIds = (menu, menuItems = []) => {
  const rawIds = Array.isArray(menu.menu_items) && menu.menu_items.length
    ? menu.menu_items.map((item) => item.id)
    : parseMenuItemIds(menu.menu_item_ids);

  const menuItemIds = new Set(menuItems.map((item) => item.id));

  return rawIds
    .map((id) => {
      if (menuItemIds.has(id)) return id;

      const numericId = Number(id);
      if (Number.isFinite(numericId) && menuItemIds.has(numericId)) {
        return numericId;
      }

      const stringId = String(id);
      if (menuItemIds.has(stringId)) return stringId;

      return id;
    })
    .filter((id) => id !== undefined && id !== null);
};

const MenuRow = ({
  menu,
  menuItems,
  setMenus,
  editingMenuId,
  setEditingMenuId,
  expandedMenuId,
  handleExpand,
}) => {
  const menuItemIds = useMemo(
    () => normalizeMenuItemIds(menu, menuItems),
    [menu, menuItems]
  );
  const menuItemsById = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item])),
    [menuItems]
  );
  const orderedMenuItems = useMemo(
    () => menuItemIds.map((id) => menuItemsById.get(id)).filter(Boolean),
    [menuItemIds, menuItemsById]
  );

  const [editedMenuName, setEditedMenuName] = useState(menu.name);
  const [editedMenuItemsIds, setEditedMenuItemsIds] = useState(menuItemIds);

  const isEditing = editingMenuId === menu.id;
  const isExpanded = expandedMenuId === menu.id;
  const menuItemsCount = orderedMenuItems.length || menuItemIds.length;

  useEffect(() => {
    if (isEditing) {
      setEditedMenuName(menu.name);
      setEditedMenuItemsIds(menuItemIds);
    }
  }, [isEditing, menu, menuItemIds]);

  const handleUpdate = async () => {
    try {
      const updatedMenu = {
        name: editedMenuName,
        menu_item_ids: editedMenuItemsIds,
      };
      const response = await instance.put(`/menus/${menu.id}`, updatedMenu);
      if (response.status === 200) {
        message.success("Menu updated successfully");
        setMenus((prevMenus) =>
          prevMenus?.map((item) =>
            item.id === menu.id
              ? {
                  ...item,
                  ...updatedMenu,
                  menu_items: editedMenuItemsIds
                    .map((id) => menuItemsById.get(id))
                    .filter(Boolean),
                }
              : item
          )
        );
        setEditingMenuId(null);
      } else {
        message.error("Error updating menu");
      }
    } catch {
      message.error("Error updating menu");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await instance.delete(`/menus/${menu.id}`);
      if (response.status === 200) {
        message.success("Menu deleted successfully");
        setMenus((prevMenus) =>
          prevMenus.filter((item) => item.id !== menu.id)
        );
      } else {
        message.error("Error deleting menu");
      }
    } catch {
      message.error("Error deleting menu");
    }
  };

  const startEditing = (e) => {
    e?.stopPropagation?.();
    setEditingMenuId(menu.id);
    if (!isExpanded) handleExpand(menu.id);
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
        onClick={() => handleExpand(menu.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleExpand(menu.id);
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
            handleExpand(menu.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <MenuOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{menu.id}
            </span>
            {menuItemsCount > 0 && (
              <span className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                {menuItemsCount} item{menuItemsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <h3 className="mt-1.5 truncate text-base font-semibold text-gray-900 sm:text-lg">
            {menu.name || "Untitled menu"}
          </h3>

          {menuItemsCount > 0 && (
            <div
              className="mt-2 flex flex-wrap gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {orderedMenuItems.slice(0, 3).map((item) => (
                <Tag
                  key={item.id}
                  className="m-0 inline-flex items-center rounded-md border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                >
                  {item.title}
                </Tag>
              ))}
              {menuItemsCount > 3 && (
                <Tag className="m-0 rounded-md border-gray-200 bg-gray-50 text-xs text-gray-500">
                  +{menuItemsCount - 3} more
                </Tag>
              )}
            </div>
          )}
        </div>

        {!isExpanded && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Edit menu">
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
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                      Menu name
                    </label>
                    <Input
                      value={editedMenuName}
                      onChange={(e) => setEditedMenuName(e.target.value)}
                      placeholder="Menu name"
                      prefix={<MenuOutlined className="text-gray-400" />}
                      allowClear
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
                      Menu items — drag to order
                    </label>
                    <SortableMenuItemsPicker
                      menuItems={menuItems}
                      value={editedMenuItemsIds}
                      onChange={setEditedMenuItemsIds}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Menu name">{menu.name || "—"}</InfoRow>
                    <InfoRow label="Total items">
                      {menuItemsCount > 0
                        ? `${menuItemsCount} item${menuItemsCount !== 1 ? "s" : ""}`
                        : "No items"}
                    </InfoRow>
                  </dl>

                  {menuItemsCount > 0 ? (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MenuOutlined className="text-sm text-brand-dark" />
                        <h4 className="text-sm font-semibold text-gray-800">
                          Menu items
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {orderedMenuItems.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-0.5 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <span className="text-sm font-medium text-gray-800">
                              {item.title}
                            </span>
                            {item.link && (
                              <span className="flex items-center gap-1 truncate font-mono text-xs text-gray-500">
                                <LinkOutlined className="shrink-0 text-[10px]" />
                                {item.link}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-3 text-sm text-gray-500">
                      No menu items assigned yet
                    </p>
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
                    onClick={() => setEditingMenuId(null)}
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
                    title="Delete this menu?"
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
    </Card>
  );
};

export default MenuRow;
