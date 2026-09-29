// components/Navbars/NavbarsList.js

import React from "react";
import { Empty, Button } from "antd";
import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
import NavbarRow from "./NavbarRow";

const NavbarsList = ({
  navbars,
  media,
  setNavbars,
  onView,
  onEdit,
  onCreate,
}) => {
  if (!navbars.length) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
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
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              Create navbar
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-4 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {navbars.map((navbar) => (
          <NavbarRow
            key={navbar.id}
            navbar={navbar}
            media={media}
            setNavbars={setNavbars}
            onView={onView}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default NavbarsList;
