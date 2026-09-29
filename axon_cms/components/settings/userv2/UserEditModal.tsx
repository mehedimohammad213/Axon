import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Button, Upload, Select, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import instance from "../../../axios";
import { usePermissions } from "../../../src/hooks/usePermissions";

const { Option } = Select;

const UserEditModal = ({
  visible,
  user,
  onCancel,
  fetchUsers,
  roles,
  currentUser,
}) => {
  const [form] = Form.useForm();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const [avatar, setAvatar] = useState(user?.profile_picture);
  const [loading, setLoading] = useState(false);

  const canManageUsers =
    isSuperAdmin || hasPermission("edit_users") || hasPermission("admin_all");
  const isEditingSelf = currentUser?.id === user?.id;
  const canEdit = canManageUsers || isEditingSelf;

  useEffect(() => {
    if (!visible) return;

    if (!canEdit) {
      message.error("You don't have permission to edit this user");
      onCancel();
      return;
    }

    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id ? parseInt(user.role_id, 10) : undefined,
      });
      setAvatar(user.profile_picture);
    }
  }, [visible, user, form, canEdit, onCancel]);

  const handleUploadChange = (info) => {
    if (info.file.status === "done") {
      setAvatar(info.file.response.url);
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      setLoading(true);

      if (values.role_id !== user.role_id && isEditingSelf) {
        message.error("You cannot change your own role");
        return;
      }

      await instance.put(`/admin/user/${user.id}`, {
        ...values,
        profile_picture: avatar,
      });
      message.success("User updated successfully");
      fetchUsers();
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/user-settings.svg"
            alt="Users"
            className="w-6"
          />
          <span>{isEditingSelf ? "Edit Your Profile" : "Edit User"}</span>
        </div>
      }
      open={visible}
      onClose={onCancel}
      placement="right"
      width="min(720px, 92vw)"
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      footer={
        <div className="flex w-full justify-end">
          <Button
            type="primary"
            loading={loading}
            className="headlessbutton headlessbutton-pill !mr-0"
            onClick={() => form.submit()}
          >
            Update User
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleUpdateUser}>
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
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter the name" }]}
            >
              <Input placeholder="Jane Admin" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter the email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="user@acme.com" />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="+1 555 0100" />
            </Form.Item>
            <Form.Item name="role_id" label="Role">
              <Select
                disabled={isEditingSelf || !canManageUsers}
                placeholder="Select a role"
              >
                {roles?.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <Form.Item label="Avatar" style={{ marginBottom: 0 }}>
            <Upload
              name="avatar"
              action="/upload"
              onChange={handleUploadChange}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default UserEditModal;
