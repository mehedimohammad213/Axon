// components/MenuItems/MenuItemRow.js

import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Radio,
  Popconfirm,
  message,
  Card,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  DeleteOutlined,
  CloseCircleOutlined,
  MenuOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import instance from "../../axios";

const { Option } = Select;

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const MenuItemRow = ({
  menuItem,
  allMenuItems,
  pages,
  setMenuItems,
  editingItemId,
  setEditingItemId,
}) => {
  const [editedTitleEn, setEditedTitleEn] = useState(menuItem.title);
  const [editedTitleBn, setEditedTitleBn] = useState(menuItem.title_bn);
  const [editedLink, setEditedLink] = useState(menuItem.link);
  const [linkType, setLinkType] = useState(
    menuItem.link && menuItem.link.startsWith("/") ? "page" : "independent"
  );
  const [editedParentId, setEditedParentId] = useState(menuItem.parent_id);

  const isEditing = editingItemId === menuItem.id;

  useEffect(() => {
    if (isEditing) {
      setEditedTitleEn(menuItem.title);
      setEditedTitleBn(menuItem.title_bn);
      setEditedLink(menuItem.link);
      setLinkType(
        menuItem.link && menuItem.link.startsWith("/") ? "page" : "independent"
      );
      setEditedParentId(menuItem.parent_id);
    }
  }, [isEditing, menuItem]);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

  const generateFullLink = (page) => {
    const parentPaths = [];
    let currentParentId = editedParentId;

    while (currentParentId) {
      const parentMenuItem = allMenuItems?.find(
        (item) => item.id === parseInt(currentParentId, 10)
      );
      if (parentMenuItem) {
        parentPaths.unshift(generateSlug(parentMenuItem.title));
        currentParentId = parseInt(parentMenuItem.parent_id, 10);
      } else {
        break;
      }
    }

    const currentMenuItemSlug = generateSlug(editedTitleEn);
    const fullPath = `/${[...parentPaths, currentMenuItemSlug].join("/")}`;
    const pageId = page ? page.id : "";
    const pageName = page ? generateSlug(page.page_name_en) : "";
    const queryParams = page ? `?pageId=${pageId}&pageName=${pageName}` : "";

    return fullPath + queryParams;
  };

  const handleUpdate = async () => {
    try {
      let fullLink = editedLink;

      if (linkType === "page") {
        const selectedPage = pages.find((page) => page.slug === editedLink);
        fullLink = generateFullLink(selectedPage);
      }

      const updatedMenuItem = {
        ...menuItem,
        title: editedTitleEn || menuItem.title,
        title_bn: editedTitleBn || menuItem.title_bn,
        parent_id: editedParentId || null,
        link: fullLink || menuItem.link,
      };

      const response = await instance.put(
        `/menuitems/${menuItem.id}`,
        updatedMenuItem
      );
      if (response.status === 200) {
        message.success("Menu item updated successfully");
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === menuItem.id ? response.data : item
          )
        );
        setEditingItemId(null);
      } else {
        message.error("Error updating menu item");
      }
    } catch {
      message.error("Error updating menu item");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await instance.delete(`/menuitems/${menuItem.id}`);
      if (response.status === 200) {
        message.success("Menu item deleted successfully");
        setMenuItems((prev) => prev.filter((item) => item.id !== menuItem.id));
      } else {
        message.error("Error deleting menu item");
      }
    } catch {
      message.error("Error deleting menu item");
    }
  };

  const startEditing = (e) => {
    e?.stopPropagation?.();
    setEditingItemId(menuItem.id);
  };

  const getParentTitle = (parentId) => {
    if (!parentId) return "No parent";
    const parentMenuItem = allMenuItems.find(
      (item) => item.id === parseInt(parentId, 10)
    );
    return parentMenuItem ? parentMenuItem.title : "No parent";
  };

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
      onClick={() => setEditingItemId(null)}
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
      title="Move this menu item to trash?"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Title (English)
              </label>
              <Input
                value={editedTitleEn}
                onChange={(e) => setEditedTitleEn(e.target.value)}
                placeholder="Item name"
                prefix={<MenuOutlined className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Title (Bangla)
              </label>
              <Input
                value={editedTitleBn}
                onChange={(e) => setEditedTitleBn(e.target.value)}
                placeholder="আইটেম নাম"
                prefix={<GlobalOutlined className="text-gray-400" />}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
              Parent item
            </label>
            <Select
              showSearch
              placeholder="Select a parent item"
              optionFilterProp="children"
              onChange={(value) => setEditedParentId(value)}
              className="w-full max-w-md"
              allowClear
              value={editedParentId || undefined}
            >
              {allMenuItems
                ?.filter((item) => item.id !== menuItem.id)
                .map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.title}
                  </Option>
                ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
              Link type
            </label>
            <Radio.Group
              onChange={(e) => setLinkType(e.target.value)}
              value={linkType}
              className="mb-3 flex gap-4"
            >
              <Radio value="independent">Custom link</Radio>
              <Radio value="page">Page link</Radio>
            </Radio.Group>

            {linkType === "page" ? (
              <Select
                showSearch
                placeholder="Select a page"
                optionFilterProp="children"
                onChange={(value) => setEditedLink(value)}
                className="w-full max-w-md"
                value={editedLink || undefined}
              >
                {pages.map((page) => (
                  <Option key={page.id} value={page.slug}>
                    {page.page_name_en}
                  </Option>
                ))}
              </Select>
            ) : (
              <Input
                value={editedLink}
                onChange={(e) => setEditedLink(e.target.value)}
                placeholder="Enter custom link"
                prefix={<LinkOutlined className="text-gray-400" />}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col pt-3">
          <div className="media-card-meta flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Badge count={`ID-${menuItem.id}`} style={idBadgeStyle} />
              <h3
                className="m-0 truncate text-base font-semibold"
                title={menuItem.title || "Untitled item"}
              >
                {menuItem.title || "Untitled item"}
              </h3>
            </div>
            <h5 className="mb-0 shrink-0 text-sm font-bold text-gray-400">
              Menu item
            </h5>
          </div>

          <p className="mt-2 truncate text-sm leading-5 text-gray-500">
            {menuItem.title_bn || "No alternate title"}
          </p>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Parent
              </span>
              <span className="truncate text-sm font-medium text-gray-800">
                {getParentTitle(menuItem.parent_id)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Link
              </span>
              {menuItem.link ? (
                <a
                  href={menuItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 items-center gap-1.5 truncate text-brand-dark hover:underline"
                >
                  <LinkOutlined className="text-xs" />
                  <span className="truncate">{menuItem.link}</span>
                </a>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MenuItemRow;
