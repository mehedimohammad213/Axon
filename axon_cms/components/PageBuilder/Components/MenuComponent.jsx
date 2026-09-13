// components/PageBuilder/Components/MenuComponent.jsx

import React, { useState, useEffect } from "react";
import {
  Button,
  Menu,
  Space,
  Typography,
  Drawer,
  Radio,
  message,
  Input,
} from "antd";
import {
  DragOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import MenuItemSelectionModal from "../Modals/MenuItemSelectionModal";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const { Text } = Typography;

const MenuComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [menuData, setMenuData] = useState(component._headless);
  const [menuMode, setMenuMode] = useState(component.menuMode || "horizontal");
  const [menuTheme, setMenuTheme] = useState(component.menuTheme || "light");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [altTitle, setAltTitle] = useState(component._headless?.altTitle || "");

  useEffect(() => {
    setMenuData(component._headless);
    setAltTitle(component._headless?.altTitle || "");
  }, [component._headless]);

  const handleConfirmSelection = (items) => {
    setSelectedItems(items);
    setShowConfig(true);
  };

  const handleSaveConfig = () => {
    if (!selectedItems.length) {
      message.error("Please select at least one menu item.");
      return;
    }
    const headless = {
      menu_item_ids: selectedItems.map((item) => item.id),
      menu_items: selectedItems,
      altTitle,
    };
    updateComponent({
      ...component,
      _headless: headless,
      menu_item_ids: headless.menu_item_ids,
      menuMode,
      menuTheme,
    });
    setMenuData(headless);
    setIsDrawerVisible(false);
    setShowConfig(false);
    setSelectedItems([]);
    message.success("Menu updated successfully.");
  };

  const handleDelete = () => {
    deleteComponent();
  };

  const getDisplayTitle = (item) => {
    if (altTitle && item.title_bn) {
      return item.title_bn;
    }
    return item.title;
  };

  const renderMenuItems = (menuItems) => {
    return menuItems?.map((item) => {
      const displayTitle = getDisplayTitle(item);

      if (item.all_children && item.all_children.length > 0) {
        return (
          <Menu.SubMenu
            key={item.id}
            title={
              <span className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                {displayTitle}
              </span>
            }
          >
            {renderMenuItems(item.all_children)}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={item.id}>
          <span className="flex items-center gap-2">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            {displayTitle}
          </span>
        </Menu.Item>
      );
    });
  };

  if (preview) {
    return (
      <div className="preview-menu-component p-4 bg-gray-100 rounded-md">
        {menuData?.menu_items?.length ? (
          <Menu
            mode={menuData.menuMode || menuMode}
            theme={menuData.menuTheme || menuTheme}
            className="flex-grow"
            style={{ border: "none" }}
          >
            {renderMenuItems(menuData.menu_items)}
          </Menu>
        ) : (
          <Text type="secondary">No menu items selected.</Text>
        )}
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DragOutlined className="text-2xl border rounded-md p-1" />
          <h3 className="text-xl font-semibold">Menu Component</h3>
        </div>
        <div className="flex items-center gap-2">
          <Space>
            {menuData?.menu_items?.length > 0 && (
              <ComponentEditButton
                onClick={() => setIsDrawerVisible(true)}
                title="Edit menu"
              />
            )}
            <ComponentDuplicateButton
              onClick={onDuplicateElement}
              title="Duplicate component"
            />
            <ComponentDeleteButton
              onConfirm={handleDelete}
              title="Delete component"
              confirmTitle="Are you sure you want to delete this component?"
            />
          </Space>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {menuData?.menu_items?.length ? (
          <div className="w-full">
            <Menu
              mode={menuData.menuMode || menuMode}
              theme={menuData.menuTheme || menuTheme}
              className="w-full"
              style={{ border: "none" }}
            >
              {renderMenuItems(menuData.menu_items)}
            </Menu>
          </div>
        ) : (
          <ComponentEditButton
            onClick={() => setIsDrawerVisible(true)}
            title="Choose menu items"
          />
        )}
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            {showConfig && (
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                onClick={() => setShowConfig(false)}
              />
            )}
            {showConfig ? "Menu Configuration" : "Select Menu Items"}
          </div>
        }
        placement="right"
        width={showConfig ? 700 : 900}
        onClose={() => {
          setIsDrawerVisible(false);
          setShowConfig(false);
          setSelectedItems([]);
        }}
        open={isDrawerVisible}
        extra={
          showConfig && (
            <Space>
              <Button
                onClick={() => {
                  setIsDrawerVisible(false);
                  setShowConfig(false);
                  setSelectedItems([]);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={handleSaveConfig}>
                Save
              </Button>
            </Space>
          )
        }
      >
        {!showConfig ? (
          <MenuItemSelectionModal
            onConfirmSelection={handleConfirmSelection}
            selectedMenuItems={menuData?.menu_items || []}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <GlobalOutlined />
                Multi-Language Settings
              </h4>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-medium mb-1">Alternative Title</p>
                  <p className="text-sm text-gray-600">
                    Enter alternative title to display instead of default menu
                    title
                  </p>
                </div>
                <Input
                  placeholder="Enter alternative title"
                  value={altTitle}
                  onChange={(e) => setAltTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Text strong>Menu Mode</Text>
              <Radio.Group
                value={menuMode}
                onChange={(e) => setMenuMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="horizontal">Horizontal</Radio.Button>
                <Radio.Button value="vertical">Vertical</Radio.Button>
              </Radio.Group>
            </div>
            <div className="flex flex-col gap-2">
              <Text strong>Menu Theme</Text>
              <Radio.Group
                value={menuTheme}
                onChange={(e) => setMenuTheme(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="light">Light</Radio.Button>
                <Radio.Button value="dark">Dark</Radio.Button>
              </Radio.Group>
            </div>
            <div className="border rounded-md p-4">
              <Text strong>Preview</Text>
              <Menu
                mode={menuMode}
                theme={menuTheme}
                className="mt-2"
                style={{ border: "none" }}
              >
                {renderMenuItems(selectedItems)}
              </Menu>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MenuComponent;
