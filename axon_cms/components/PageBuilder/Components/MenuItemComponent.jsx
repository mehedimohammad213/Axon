import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  Typography,
  Drawer,
  message,
  Input,
  Tag,
} from "antd";
import {
  DragOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import MenuItemSelectionModal from "../Modals/MenuItemSelectionModal";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const { Text } = Typography;

const normalizeMenuItems = (headless) => {
  if (!headless) return [];
  if (Array.isArray(headless)) return headless;
  if (Array.isArray(headless.items)) return headless.items;
  if (headless.id || headless.title) return [headless];
  return [];
};

const MenuItemComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [menuItemsData, setMenuItemsData] = useState(
    normalizeMenuItems(component._headless)
  );
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [altTitle, setAltTitle] = useState(
    (!Array.isArray(component._headless) && component._headless?.altTitle) || ""
  );

  useEffect(() => {
    setMenuItemsData(normalizeMenuItems(component._headless));
    setAltTitle(
      (!Array.isArray(component._headless) && component._headless?.altTitle) ||
        ""
    );
  }, [component._headless]);

  const handleConfirmSelection = (items) => {
    setSelectedMenuItems(items);
    setShowConfig(true);
  };

  const handleSaveConfig = () => {
    if (!selectedMenuItems.length) {
      message.error("Please select at least one menu item.");
      return;
    }

    const headlessPayload = {
      items: selectedMenuItems,
      altTitle,
    };

    updateComponent({
      ...component,
      _headless: headlessPayload,
      id: selectedMenuItems.map((item) => item.id),
      selectionMode: "multiple",
    });
    setMenuItemsData(selectedMenuItems);
    setIsDrawerVisible(false);
    setShowConfig(false);
    setSelectedMenuItems([]);
    message.success("Menu items updated successfully.");
  };

  const handleDelete = () => {
    deleteComponent();
  };

  const openDrawer = () => {
    setSelectedMenuItems(menuItemsData);
    setShowConfig(false);
    setIsDrawerVisible(true);
  };

  const renderMenuItemRow = (item, index) => (
    <div
      key={item.id || index}
      className="flex flex-col gap-1 rounded-md border border-slate-100 bg-slate-50 p-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Text strong className="text-base">
          {item.title || "Untitled"}
        </Text>
        {item.title_bn && item.title_bn !== "N/A" && (
          <Tag>{item.title_bn}</Tag>
        )}
      </div>
      {item.link && (
        <a
          href={item.link}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          onClick={(e) => e.preventDefault()}
        >
          <LinkOutlined />
          {item.link}
        </a>
      )}
    </div>
  );

  const renderMenuItemsPreview = (items) => {
    if (!items?.length) {
      return <Text type="secondary">No menu items selected.</Text>;
    }

    return (
      <div className="flex flex-col gap-3">
        {altTitle && (
          <Text strong className="text-lg">
            {altTitle}
          </Text>
        )}
        <div className="flex flex-col gap-2">
          {items.map((item, index) => renderMenuItemRow(item, index))}
        </div>
      </div>
    );
  };

  if (preview) {
    return (
      <div className="preview-menu-item-component p-4 bg-gray-100 rounded-md">
        {renderMenuItemsPreview(menuItemsData)}
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DragOutlined className="text-2xl border rounded-md p-1" />
          <h3 className="text-xl font-semibold">Menu Item Component</h3>
          {menuItemsData.length > 0 && (
            <Tag color="blue">{menuItemsData.length} items</Tag>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Space>
            {menuItemsData.length > 0 && (
              <ComponentEditButton
                onClick={openDrawer}
                title="Edit menu items"
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
        {menuItemsData.length > 0 ? (
          <div className="w-full">{renderMenuItemsPreview(menuItemsData)}</div>
        ) : (
          <div className="flex justify-center items-center p-8">
            <Button
              className="headlessbutton"
              type="primary"
              onClick={openDrawer}
              size="large"
            >
              Choose Menu Item
            </Button>
          </div>
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
            {showConfig ? "Menu Items Configuration" : "Select Menu Items"}
          </div>
        }
        placement="right"
        width={showConfig ? 700 : 900}
        onClose={() => {
          setIsDrawerVisible(false);
          setShowConfig(false);
          setSelectedMenuItems([]);
        }}
        open={isDrawerVisible}
        extra={
          showConfig && (
            <Space>
              <Button
                onClick={() => {
                  setIsDrawerVisible(false);
                  setShowConfig(false);
                  setSelectedMenuItems([]);
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
            selectedMenuItems={selectedMenuItems}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <GlobalOutlined />
                Display Settings
              </h4>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="font-medium mb-1">Group Title (optional)</p>
                  <p className="text-sm text-gray-600">
                    Optional heading shown above the selected menu items
                  </p>
                </div>
                <Input
                  placeholder="Enter group title"
                  value={altTitle}
                  onChange={(e) => setAltTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-md p-4">
              <Text strong>
                Preview ({selectedMenuItems.length} item
                {selectedMenuItems.length === 1 ? "" : "s"})
              </Text>
              <div className="mt-2">
                {renderMenuItemsPreview(selectedMenuItems)}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MenuItemComponent;
