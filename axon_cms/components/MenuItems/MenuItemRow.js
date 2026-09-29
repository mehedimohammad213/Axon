// components/MenuItems/MenuItemRow.js

import React from "react";
import { Button, Popconfirm, Card, Badge, message } from "antd";
import {
  EditOutlined,
  DeleteFilled,
  DeleteOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import instance from "../../axios";

const idBadgeStyle = {
  backgroundColor: "#f0f0f0",
  color: "#666",
  fontSize: "12px",
  fontWeight: "500",
};

const MenuItemRow = ({
  menuItem,
  allMenuItems,
  setMenuItems,
  onView,
  onEdit,
}) => {
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

  const getParentTitle = (parentId) => {
    if (!parentId) return "No parent";
    const parentMenuItem = allMenuItems.find(
      (item) => item.id === parseInt(parentId, 10)
    );
    return parentMenuItem ? parentMenuItem.title : "No parent";
  };

  const actions = [
    <Button
      key="edit"
      icon={<EditOutlined />}
      onClick={() => onEdit?.(menuItem)}
      className="page-card-btn page-card-btn-primary !mr-0"
    >
      Edit
    </Button>,
    <Button
      key="view"
      icon={<EyeOutlined />}
      onClick={() => onView?.(menuItem)}
      className="page-card-btn page-card-btn-soft !mr-0"
    >
      Preview
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
      actions={actions}
      className="media-card slider-card page-list-card overflow-hidden shadow-md rounded-md"
    >
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
                onClick={(e) => e.stopPropagation()}
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
    </Card>
  );
};

export default MenuItemRow;
