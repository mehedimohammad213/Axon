// components/Navbars/NavbarsList.js

import React from "react";
import { Empty, Button } from "antd";
import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
import NavbarRow from "./NavbarRow";

const NavbarsList = ({
  navbars,
  menus,
  media,
  setNavbars,
  editingNavbarId,
  setEditingNavbarId,
  fetchNavbars,
  expandedNavbarId,
  handleExpand,
  onCreate,
}) => {
  if (!navbars.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <MenuOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">
                No navbars yet
              </p>
              <p className="text-sm text-gray-500">
                Create a navbar to manage your site navigation.
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
              Create navbar
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {navbars.map((navbar) => (
          <NavbarRow
            key={navbar.id}
            navbar={navbar}
            menus={menus}
            media={media}
            setNavbars={setNavbars}
            editingNavbarId={editingNavbarId}
            setEditingNavbarId={setEditingNavbarId}
            fetchNavbars={fetchNavbars}
            expandedNavbarId={expandedNavbarId}
            handleExpand={handleExpand}
          />
        ))}
      </div>
    </div>
  );
};

export default NavbarsList;
