// components/Navbars/AddNavbarForm.js

import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, message, Drawer } from "antd";
import { PlusCircleOutlined, FileImageFilled } from "@ant-design/icons";
import instance from "../../axios";
import MediaSelectionModal from "../PageBuilder/Modals/MediaSelectionModal";
import SortableMenuItemsPicker from "../MenuItems/SortableMenuItemsPicker";
import AddMenuItemForm from "../MenuItems/AddMenuItemForm";
import EditMenuItemForm from "../MenuItems/EditMenuItemForm";
import Image from "next/image";

const getNavbarLogoId = (navbar) =>
  navbar?.logo_id ?? navbar?.logo?.id ?? null;

const AddNavbarForm = ({
  media,
  onCancel,
  fetchNavbars,
  onNavbarCreated,
  initialMenuItemIds = [],
  editingNavbar = null,
  formId = "navbar-form",
  onLoadingChange,
  showSubmitButton = true,
}) => {
  const isEdit = Boolean(editingNavbar?.id);
  const [form] = Form.useForm();
  const [logoId, setLogoId] = useState(
    isEdit ? getNavbarLogoId(editingNavbar) : null
  );
  const [menuItemIds, setMenuItemIds] = useState(
    isEdit
      ? editingNavbar.menu_items?.map((item) => item.id) ||
          editingNavbar.menu_item_ids ||
          []
      : Array.isArray(initialMenuItemIds)
        ? initialMenuItemIds
        : []
  );
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(
    isEdit ? editingNavbar?.logo || null : null
  );
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuItemSubmitting, setMenuItemSubmitting] = useState(false);
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
    setMenuItemIds((prev) => [
      ...prev,
      ...ids.filter((id) => !prev.includes(id)),
    ]);
  };

  useEffect(() => {
    fetchMenuItems();
    fetchPages();
  }, [fetchMenuItems, fetchPages]);

  useEffect(() => {
    if (isEdit && editingNavbar) {
      form.setFieldsValue({
        title_en: editingNavbar.title_en || "",
        title_bn: editingNavbar.title_bn || "",
      });
      setLogoId(getNavbarLogoId(editingNavbar));
      setMenuItemIds(
        editingNavbar.menu_items?.map((item) => item.id) ||
          editingNavbar.menu_item_ids ||
          []
      );
      setSelectedMedia(editingNavbar.logo || null);
    }
  }, [isEdit, editingNavbar, form]);

  const handleSubmit = async (values) => {
    if (!logoId) {
      message.error("Please select a logo");
      return;
    }
    if (!menuItemIds.length) {
      message.error("Select at least one menu item");
      return;
    }

    const payload = {
      title_en: (values.title_en || "").trim(),
      title_bn: (values.title_bn || "").trim(),
      logo_id: logoId,
      menu_item_ids: menuItemIds,
    };

    try {
      setSaving(true);
      onLoadingChange?.(true);
      if (isEdit) {
        const response = await instance.put(
          `/navbars/${editingNavbar.id}`,
          payload
        );
        if (response.status === 200) {
          message.success("Navbar updated successfully");
          fetchNavbars?.();
          onCancel?.();
        } else {
          message.error("Error updating navbar");
        }
      } else {
        const response = await instance.post("/navbars", payload);
        if (response.status === 201) {
          message.success("Navbar created successfully");
          fetchNavbars?.();
          onNavbarCreated?.(response.data);
          form.resetFields();
          setLogoId(null);
          setSelectedMedia(null);
          setMenuItemIds(
            Array.isArray(initialMenuItemIds) ? initialMenuItemIds : []
          );
          onCancel?.();
        } else {
          message.error("Error creating navbar");
        }
      }
    } catch {
      message.error(isEdit ? "Error updating navbar" : "Error creating navbar");
    } finally {
      setSaving(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <>
      <Form
        id={formId}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          title_en: editingNavbar?.title_en || "",
          title_bn: editingNavbar?.title_bn || "",
        }}
      >
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: "#ffffff",
          }}
        >
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              label="Title (English)"
              name="title_en"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Navbar Title (English)" disabled={saving} />
            </Form.Item>
            <Form.Item label="Title (Alternate)" name="title_bn">
              <Input placeholder="Navbar Title (Alternate)" disabled={saving} />
            </Form.Item>
          </div>

          <Form.Item label="Logo" required>
            <div className="flex items-center gap-3">
              {logoId && selectedMedia ? (
                <Image
                  src={
                    selectedMedia.file_path
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${selectedMedia.file_path}`
                      : "/images/Image_placeholder.png"
                  }
                  alt={selectedMedia.file_name || "Navbar Logo"}
                  width={40}
                  height={40}
                  className="rounded-md object-contain border border-gray-200"
                />
              ) : null}
              <Button
                icon={<FileImageFilled />}
                onClick={() => setMediaModalVisible(true)}
                className="headlessbutton headlessbutton-pill !mr-0"
                disabled={saving}
              >
                {logoId ? "Change Logo" : "Select Logo"}
              </Button>
            </div>
          </Form.Item>
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">
              Menu Items — select multiple and drag to order
            </label>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => setIsAddMenuItemOpen(true)}
              className="headlessbutton headlessbutton-pill !mr-0"
              disabled={saving}
            >
              Create Item
            </Button>
          </div>
          <SortableMenuItemsPicker
            menuItems={menuItems}
            value={menuItemIds}
            onChange={setMenuItemIds}
            onEdit={(item) => {
              const fullItem =
                menuItems.find((menuItem) => menuItem.id === item?.id) || item;
              setEditingMenuItem(fullItem);
            }}
          />
        </div>
      </Form>

      {showSubmitButton && (
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            form={formId}
            loading={saving}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            {isEdit ? "Update Navbar" : "Create Navbar"}
          </Button>
        </div>
      )}

      <MediaSelectionModal
        isVisible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        selectionMode="single"
        onSelectMedia={(selected) => {
          const mediaItem = Array.isArray(selected) ? selected[0] : selected;
          if (mediaItem?.id) {
            setLogoId(mediaItem.id);
            setSelectedMedia(mediaItem);
          }
          setMediaModalVisible(false);
        }}
      />

      <Drawer
        open={Boolean(editingMenuItem)}
        onClose={() => setEditingMenuItem(null)}
        destroyOnClose
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
        width="min(720px, 92vw)"
        zIndex={1300}
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="edit-menu-item-form-nested"
              htmlType="submit"
              loading={menuItemSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Update Menu
            </Button>
          </div>
        }
      >
        {editingMenuItem && (
          <EditMenuItemForm
            formId="edit-menu-item-form-nested"
            menuItem={editingMenuItem}
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setEditingMenuItem(null)}
            onLoadingChange={setMenuItemSubmitting}
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
            showSubmitButton={false}
          />
        )}
      </Drawer>

      <Drawer
        open={isAddMenuItemOpen}
        onClose={() => setIsAddMenuItemOpen(false)}
        destroyOnClose
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
        width="min(720px, 92vw)"
        zIndex={1300}
        rootClassName="media-preview-drawer org-form-drawer"
        footer={
          <div className="flex w-full justify-end">
            <Button
              type="primary"
              form="add-menu-item-form-nested"
              htmlType="submit"
              loading={menuItemSubmitting}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Menu
            </Button>
          </div>
        }
      >
        {isAddMenuItemOpen && (
          <AddMenuItemForm
            formId="add-menu-item-form-nested"
            pages={pages}
            menuItems={menuItems}
            onCancel={() => setIsAddMenuItemOpen(false)}
            fetchMenuItems={fetchMenuItems}
            onMenuItemCreated={appendCreatedMenuItems}
            onLoadingChange={setMenuItemSubmitting}
            showSubmitButton={false}
          />
        )}
      </Drawer>
    </>
  );
};

export default AddNavbarForm;
