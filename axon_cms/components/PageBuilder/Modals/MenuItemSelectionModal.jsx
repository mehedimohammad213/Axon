import React, { useState, useEffect, useMemo } from "react";
import {
  List,
  Button,
  Input,
  Typography,
  message,
  Modal,
  Tooltip,
  Tag,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  LinkOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import instance from "../../../axios";
import AddMenuItemForm from "../../MenuItems/AddMenuItemForm";

const { Text } = Typography;

const MenuItemSelectionModal = ({
  onConfirmSelection,
  selectedMenuItems = [],
}) => {
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [localSelection, setLocalSelection] = useState([]);

  useEffect(() => {
    fetchMenuItems();
    fetchPages();
  }, []);

  useEffect(() => {
    setLocalSelection(Array.isArray(selectedMenuItems) ? selectedMenuItems : []);
  }, [selectedMenuItems]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/menuitems");
      setMenuItems(response.data || []);
      setError(null);
      return response.data || [];
    } catch (err) {
      setError("Failed to fetch menu items");
      message.error("Failed to fetch menu items");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await instance.get("/pages");
      setPages(response.data || []);
    } catch (err) {
      // Pages are only needed for create form; ignore failure here
    }
  };

  const handleMenuItemCreated = async (createdItems = []) => {
    setIsFormVisible(false);
    const freshItems = await fetchMenuItems();
    const created = Array.isArray(createdItems)
      ? createdItems[0]
      : createdItems;
    const fullItem =
      (created?.id &&
        freshItems.find((item) => String(item.id) === String(created.id))) ||
      created;
    if (fullItem) {
      setLocalSelection((prev) => {
        if (prev.some((item) => String(item.id) === String(fullItem.id))) {
          return prev;
        }
        return [...prev, fullItem];
      });
      message.success("Menu item created and selected.");
    }
  };

  const handleReload = async () => {
    await fetchMenuItems();
    message.success("Menu items refreshed");
  };

  const selectedIds = useMemo(
    () => new Set(localSelection.map((item) => String(item.id))),
    [localSelection]
  );

  const toggleItem = (item) => {
    const id = String(item.id);
    setLocalSelection((prev) => {
      if (prev.some((selected) => String(selected.id) === id)) {
        return prev.filter((selected) => String(selected.id) !== id);
      }
      return [...prev, item];
    });
  };

  const handleConfirm = () => {
    if (localSelection.length === 0) {
      message.error("Please select at least one menu item.");
      return;
    }
    onConfirmSelection(localSelection);
  };

  const menuItemsById = useMemo(() => {
    const map = new Map();
    menuItems.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return menuItems;
    return menuItems.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const titleBn = (item.title_bn || "").toLowerCase();
      const link = (item.link || "").toLowerCase();
      return (
        title.includes(query) ||
        titleBn.includes(query) ||
        link.includes(query)
      );
    });
  }, [menuItems, searchText]);

  const getParentTitle = (parentId) => {
    if (!parentId) return null;
    return menuItemsById.get(String(parentId))?.title || null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Tooltip title="Reload menu items">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={handleReload}
            disabled={loading}
            className="headlessbutton"
          />
        </Tooltip>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Search menu items..."
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
            Create Menu Item
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Text type="secondary">
          {localSelection.length} selected — click items to toggle
        </Text>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleConfirm}
          disabled={localSelection.length === 0}
          className="headlessbutton"
        >
          Continue with {localSelection.length || 0}
        </Button>
      </div>

      {error ? (
        <Text type="danger">{error}</Text>
      ) : (
        <List
          loading={loading}
          dataSource={filteredMenuItems}
          renderItem={(item) => {
            const parentTitle = getParentTitle(item.parent_id);
            const isSelected = selectedIds.has(String(item.id));
            return (
              <List.Item
                className={`p-4 border rounded-md cursor-pointer my-4 hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => toggleItem(item)}
              >
                <div className="flex items-start gap-3 w-full px-4">
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleItem(item)}
                  />
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Text strong>{item.title || "Untitled"}</Text>
                      {item.title_bn && item.title_bn !== "N/A" && (
                        <Tag>{item.title_bn}</Tag>
                      )}
                      {parentTitle && (
                        <Tag color="blue">Parent: {parentTitle}</Tag>
                      )}
                    </div>
                    {item.link && (
                      <Text
                        type="secondary"
                        className="flex items-center gap-1"
                      >
                        <LinkOutlined />
                        {item.link}
                      </Text>
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <Text type="secondary">No menu items found.</Text>
                <div className="mt-4">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsFormVisible(true)}
                    className="headlessbutton"
                  >
                    Create New Menu Item
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
        title="Create Menu Item"
        width={900}
        zIndex={1100}
      >
        <AddMenuItemForm
          pages={pages}
          menuItems={menuItems}
          onCancel={() => setIsFormVisible(false)}
          fetchMenuItems={fetchMenuItems}
          onMenuItemCreated={handleMenuItemCreated}
        />
      </Modal>
    </div>
  );
};

export default MenuItemSelectionModal;
