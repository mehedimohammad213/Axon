import React from "react";
import { Empty, Button } from "antd";
import { LinkOutlined, PlusOutlined } from "@ant-design/icons";
import MenuItemRow from "./MenuItemRow";

const MenuItemsList = ({
  menuItems,
  allMenuItems,
  setMenuItems,
  onView,
  onEdit,
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
              <p className="text-base font-medium text-gray-800">No menu yet</p>
              <p className="text-sm text-gray-500">
                Create a menu to build your navigation links.
              </p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create Menu
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.map((menuItem) => (
          <MenuItemRow
            key={menuItem.id}
            menuItem={menuItem}
            allMenuItems={allMenuItems}
            setMenuItems={setMenuItems}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuItemsList;
