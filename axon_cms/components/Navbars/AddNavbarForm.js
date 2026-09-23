// components/Navbars/AddNavbarForm.js

import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Input, Button, message, Modal } from "antd";
import { PlusCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import instance from "../../axios";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import SortableMenuItemsPicker from "../MenuItems/SortableMenuItemsPicker";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";
import EditMenuItemForm from "../MenuItems/EditMenuItemForm";
import Image from "next/image";

const AddNavbarForm = ({
  media,
  onCancel,
  fetchNavbars,
  onNavbarCreated,
  initialMenuItemIds = [],
}) => {
  const [newNavbarTitleEn, setNewNavbarTitleEn] = useState("");
  const [newNavbarTitleBn, setNewNavbarTitleBn] = useState("");
  const [newLogoId, setNewLogoId] = useState(null);
  const [newMenuItemIds, setNewMenuItemIds] = useState(
    Array.isArray(initialMenuItemIds) ? initialMenuItemIds : []
  );
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await instance("/menuitems");
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      }
    } catch {
      // picker will show empty
    }
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const response = await instance("/pages");
      if (Array.isArray(response.data)) {
        setPages(response.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  const appendCreatedMenuItems = (createdItems = []) => {
    const ids = createdItems.map((item) => item.id).filter(Boolean);
    if (!ids.length) return;
    setNewMenuItemIds((prev) => [
      ...prev,
      ...ids.filter((id) => !prev.includes(id)),
    ]);
  };

  useEffect(() => {
    fetchMenuItems();
    fetchPages();
  }, [fetchMenuItems, fetchPages]);

  const resetForm = () => {
    setNewNavbarTitleEn("");
    setNewNavbarTitleBn("");
    setNewLogoId(null);
    setNewMenuItemIds(
      Array.isArray(initialMenuItemIds) ? initialMenuItemIds : []
    );
    setSelectedMedia(null);
    setMediaModalVisible(false);
    setIsAddMenuItemOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleAddNavbar = async () => {
    if (!newNavbarTitleEn.trim() || !newLogoId) {
      message.error("Please fill in title and logo");
      return;
    }
    if (!newMenuItemIds.length) {
      message.error("Select at least one menu item");
      return;
    }

    try {
      setSaving(true);
      const response = await instance.post("/navbars", {
        title_en: newNavbarTitleEn,
        title_bn: newNavbarTitleBn,
        logo_id: newLogoId,
        menu_item_ids: newMenuItemIds,
      });
      if (response.status === 201) {
        message.success("Navbar created successfully");
        fetchNavbars?.();
        onNavbarCreated?.(response.data);
        resetForm();
        onCancel();
      } else {
        message.error("Error creating navbar");
      }
    } catch {
      message.error("Error creating navbar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]} align="bottom">
        <Col xs={24} md={8}>
          <div className="flex items-center gap-2">
            {newLogoId && selectedMedia ? (
              <Image
                src={
                  selectedMedia.file_path
                    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${selectedMedia.file_path}`
                    : "/images/Image_placeholder.png"
                }
                alt={selectedMedia.file_name || "Navbar Logo"}
                width={32}
                height={32}
                className="rounded-md object-contain"
              />
            ) : null}
            <Button
              onClick={() => setMediaModalVisible(true)}
              className="h-10 px-4 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-700 border-2 border-gray-200 hover:border-blue-300 font-semibold shadow-sm hover:shadow-md transition-all rounded-lg"
            >
              {newLogoId ? "Change Logo" : "Select Logo"}
            </Button>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <Input
            placeholder="Navbar Title (English)"
            value={newNavbarTitleEn}
            onChange={(e) => setNewNavbarTitleEn(e.target.value)}
          />
        </Col>
        <Col xs={24} md={8}>
          <Input
            placeholder="Navbar Title (Alternate)"
            value={newNavbarTitleBn}
            onChange={(e) => setNewNavbarTitleBn(e.target.value)}
          />
        </Col>
      </Row>

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Menu Items — select multiple and drag to order
            </label>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setIsAddMenuItemOpen(true)}
              className="h-9 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 font-semibold shadow-md hover:shadow-lg transition-all rounded-lg text-xs"
            >
              Create Item
            </Button>
          </div>
          <SortableMenuItemsPicker
            menuItems={menuItems}
            value={newMenuItemIds}
            onChange={setNewMenuItemIds}
            onEdit={(item) => {
              const fullItem =
                menuItems.find((menuItem) => menuItem.id === item?.id) || item;
              setEditingMenuItem(fullItem);
            }}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 gap-4">
        <Button
          icon={<CloseCircleOutlined />}
          onClick={handleCancel}
          className="headlesscancelbutton h-11 px-6"
        >
          Cancel
        </Button>
        <Button
          icon={<PlusCircleOutlined />}
          onClick={handleAddNavbar}
          loading={saving}
          className="h-11 px-6 bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-blue-600 text-white border-0 font-semibold shadow-md hover:shadow-xl transition-all rounded-xl"
        >
          Create Navbar
        </Button>
      </div>

      <MediaSelectionModal
        isVisible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        selectionMode="single"
        onSelectMedia={(selected) => {
          const media = Array.isArray(selected) ? selected[0] : selected;
          if (media?.id) {
            setNewLogoId(media.id);
            setSelectedMedia(media);
          }
          setMediaModalVisible(false);
        }}
      />

      <Modal
        open={Boolean(editingMenuItem)}
        onCancel={() => setEditingMenuItem(null)}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Edit Menu Item</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {editingMenuItem && (
          <EditMenuItemForm
            menuItem={editingMenuItem}
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setEditingMenuItem(null)}
            onUpdated={(updated) => {
              if (updated?.id) {
                setMenuItems((prev) =>
                  prev.map((item) =>
                    item.id === updated.id ? { ...item, ...updated } : item
                  )
                );
              }
              setEditingMenuItem(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={isAddMenuItemOpen}
        onCancel={() => setIsAddMenuItemOpen(false)}
        destroyOnClose
        footer={null}
        title={
          <div className="flex items-center gap-2">
            <img
              src="/icons/headless/menuitems.svg"
              alt="Menu Items"
              className="w-6"
            />
            <span>Add Menu Item</span>
          </div>
        }
        width={900}
        zIndex={1300}
        getContainer={() => document.body}
      >
        {isAddMenuItemOpen && (
          <AddMenuItemForm
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setIsAddMenuItemOpen(false)}
            fetchMenuItems={fetchMenuItems}
            onMenuItemCreated={appendCreatedMenuItems}
          />
        )}
      </Modal>
    </div>
  );
};

export default AddNavbarForm;
