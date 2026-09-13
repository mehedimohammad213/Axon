// components/PageBuilder/Modals/MenuSelectionModal.jsx

import React, { useState, useEffect } from "react";
import {
  List,
  Button,
  Input,
  Typography,
  message,
  Modal,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import instance from "../../../axios";
import AddMenuForm from "../../Menus/AddMenuForm";

const { Text } = Typography;

const MenuSelectionModal = ({ onSelectMenu, selectedMenu }) => {
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

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

  const hydrateMenusWithItems = (menusList, itemsList) => {
    const itemsById = new Map(
      (itemsList || []).map((item) => [String(item.id), item])
    );

    return (menusList || []).map((menu) => {
      if (Array.isArray(menu.menu_items) && menu.menu_items.length) {
        return menu;
      }

      const ids = parseMenuItemIds(menu.menu_item_ids);
      return {
        ...menu,
        menu_item_ids: ids,
        menu_items: ids
          .map((id) => itemsById.get(String(id)))
          .filter(Boolean),
      };
    });
  };

  const fetchMenus = async (itemsOverride) => {
    try {
      setLoading(true);
      const response = await instance.get("/menus");
      const items = itemsOverride ?? menuItems;
      const hydrated = hydrateMenusWithItems(response.data || [], items);
      setMenus(hydrated);
      setError(null);
      return hydrated;
    } catch (err) {
      setError("Failed to fetch menus");
      message.error("Failed to fetch menus");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await instance.get("/menuitems");
      const items = response.data || [];
      setMenuItems(items);
      return items;
    } catch (err) {
      message.error("Failed to fetch menu items");
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      const items = await fetchMenuItems();
      await fetchMenus(items);
    };
    load();
  }, []);

  const handleMenuCreated = async (createdMenu) => {
    setIsFormVisible(false);
    const items = await fetchMenuItems();
    const freshMenus = await fetchMenus(items);
    const fullMenu =
      freshMenus.find((menu) => menu.id === createdMenu.id) || createdMenu;
    onSelectMenu(fullMenu);
    message.success("Menu created. Configure settings and save.");
  };

  const handleReload = async () => {
    const items = await fetchMenuItems();
    await fetchMenus(items);
    message.success("Menus refreshed");
  };

  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Tooltip title="Reload menus">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={handleReload}
            disabled={loading}
            className="headlessbutton"
          />
        </Tooltip>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Search menus..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-full md:w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsFormVisible(true)}
            className="headlessbutton whitespace-nowrap"
          >
            Create Menu
          </Button>
        </div>
      </div>

      {error ? (
        <Text type="danger">{error}</Text>
      ) : (
        <List
          loading={loading}
          dataSource={filteredMenus}
          renderItem={(menu) => (
            <List.Item
              className={`p-4 border rounded-md cursor-pointer my-4 hover:bg-gray-50 ${
                selectedMenu?.id === menu.id
                  ? "bg-blue-50 border-blue-200"
                  : ""
              }`}
              onClick={() => onSelectMenu(menu)}
            >
              <div className="flex flex-col w-full gap-2 px-6">
                <Text strong>{menu.name}</Text>
                {menu.menu_items?.map((item) => (
                  <Text key={item.id}>{item.title}</Text>
                ))}
              </div>
            </List.Item>
          )}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <Text type="secondary">No menus found.</Text>
                <div className="mt-4">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsFormVisible(true)}
                    className="headlessbutton"
                  >
                    Create New Menu
                  </Button>
                </div>
              </div>
            ),
          }}
        />
      )}

      <Modal
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        destroyOnClose
        footer={null}
        title="Create Menu"
        width={900}
        zIndex={1100}
      >
        <AddMenuForm
          menuItems={menuItems}
          onCancel={() => setIsFormVisible(false)}
          fetchMenus={fetchMenus}
          onMenuCreated={handleMenuCreated}
        />
      </Modal>
    </div>
  );
};

export default MenuSelectionModal;
