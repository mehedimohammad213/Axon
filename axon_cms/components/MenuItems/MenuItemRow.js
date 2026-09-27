// components/MenuItems/MenuItemRow.js

import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Radio,
  Popconfirm,
  message,
  Tooltip,
  Card,
} from "antd";
import {
  EditOutlined,
  DeleteFilled,
  CloseCircleOutlined,
  MenuOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import instance from "../../axios";

const { Option } = Select;

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

const MenuItemRow = ({
  menuItem,
  allMenuItems,
  pages,
  setMenuItems,
  editingItemId,
  setEditingItemId,
  expandedItemId,
  handleExpand,
}) => {
  const [editedTitleEn, setEditedTitleEn] = useState(menuItem.title);
  const [editedTitleBn, setEditedTitleBn] = useState(menuItem.title_bn);
  const [editedLink, setEditedLink] = useState(menuItem.link);
  const [linkType, setLinkType] = useState(
    menuItem.link && menuItem.link.startsWith("/") ? "page" : "independent"
  );
  const [editedParentId, setEditedParentId] = useState(menuItem.parent_id);

  const isEditing = editingItemId === menuItem.id;
  const isExpanded = expandedItemId === menuItem.id;

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
    if (!isExpanded) handleExpand(menuItem.id);
  };

  const getParentTitle = (parentId) => {
    if (!parentId) return "No parent";
    const parentMenuItem = allMenuItems.find(
      (item) => item.id === parseInt(parentId, 10)
    );
    return parentMenuItem ? parentMenuItem.title : "No parent";
  };

  const toggleCard = () => {
    if (isEditing) return;
    handleExpand(menuItem.id);
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
            handleExpand(menuItem.id);
          }}
        >
          {isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-brand-light text-brand-dark">
          <LinkOutlined className="text-lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              #{menuItem.id}
            </span>
            {menuItem.parent_id && (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                <MenuOutlined className="text-[10px]" />
                {getParentTitle(menuItem.parent_id)}
              </span>
            )}
          </div>

          <h3
            className="mt-1.5 min-h-7 truncate text-base font-semibold leading-7 text-gray-900 sm:text-lg"
            title={menuItem.title || "Untitled item"}
          >
            {menuItem.title || "Untitled item"}
          </h3>

          <Tooltip title={menuItem.title_bn || undefined} placement="topLeft">
            <p className="mt-0.5 min-h-5 truncate text-sm leading-5 text-gray-500">
              {menuItem.title_bn || "\u00A0"}
            </p>
          </Tooltip>
        </div>

        <div
          className="flex shrink-0 items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={handleUpdate}
                className="headlessbutton headlessbutton-pill !mr-0"
              >
                Save changes
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => setEditingItemId(null)}
                className="headlesscancelbutton headlessbutton-pill !mr-0"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={startEditing}
                className="headlessbutton headlessbutton-pill !mr-0"
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this menu item?"
                description="This cannot be undone."
                onConfirm={handleDelete}
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
                  className="headlesscancelbutton headlessbutton-pill !mr-0"
                >
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4" onClick={(e) => e.stopPropagation()}>
              {isEditing ? (
                <div className="space-y-4">
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
                <div className="space-y-4">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Title (English)">
                      {menuItem.title || "—"}
                    </InfoRow>
                    <InfoRow label="Title (Bangla)">
                      {menuItem.title_bn || "—"}
                    </InfoRow>
                    <InfoRow label="Parent item">
                      {getParentTitle(menuItem.parent_id)}
                    </InfoRow>
                    <InfoRow label="Link">
                      {menuItem.link ? (
                        <a
                          href={menuItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-dark hover:underline"
                        >
                          <LinkOutlined className="text-xs" />
                          {menuItem.link}
                        </a>
                      ) : (
                        "—"
                      )}
                    </InfoRow>
                  </dl>
                </div>
              )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MenuItemRow;
