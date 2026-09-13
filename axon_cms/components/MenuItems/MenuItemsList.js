import React from "react";
import { Empty, Button } from "antd";
import { LinkOutlined, PlusOutlined } from "@ant-design/icons";
import MenuItemRow from "./MenuItemRow";

const MenuItemsList = ({
  menuItems,
  pages,
  allMenuItems,
  setMenuItems,
  editingItemId,
  setEditingItemId,
  expandedItemId,
  handleExpand,
  onCreate,
}) => {
  if (!menuItems.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <LinkOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                No menu items yet
              </p>
              <p className="text-sm text-gray-500">
                Create a menu item to build your navigation links.
              </p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="mt-2 bg-brand hover:bg-brand-dark"
            >
              Create menu item
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {menuItems.map((menuItem) => (
          <MenuItemRow
            key={menuItem.id}
            menuItem={menuItem}
            allMenuItems={allMenuItems}
            pages={pages}
            setMenuItems={setMenuItems}
            editingItemId={editingItemId}
            setEditingItemId={setEditingItemId}
            expandedItemId={expandedItemId}
            handleExpand={handleExpand}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuItemsList;
