import { useEffect } from "react";
import { Form, Input, Switch, message } from "antd";
import instance from "../../../axios";
import PermissionPicker from "./PermissionPicker";

export default function EditRole({
  role,
  permissions,
  organizationId,
  setModalVisible,
  onSuccess,
  formId = "edit-role-form",
  onLoadingChange,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!role) {
      return;
    }

    form.setFieldsValue({
      title: role.title,
      description: role.description,
      status: role.status === 1 || role.status === true,
      selectedPermissions: (role.permission_headless || []).map(
        (permission) => permission.id
      ),
    });
  }, [role, form]);

  const updateRole = async (values) => {
    if (!role?.id) {
      return;
    }

    onLoadingChange?.(true);
    const { title, description, status, selectedPermissions } = values;

    const payload = {
      title,
      description,
      status: status ? 1 : 0,
      permission_ids: selectedPermissions,
    };

    const url = organizationId
      ? `/organizations/${organizationId}/roles/${role.id}`
      : `/roles/${role.id}`;

    try {
      const response = await instance.put(url, payload);

      if (response.status === 200) {
        message.success("Role updated successfully!");
        onSuccess?.();
        setModalVisible(false);
      } else {
        message.error("Failed to update role.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "An error occurred while updating the role."
      );
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <Form
      id={formId}
      form={form}
      name="edit_role"
      layout="vertical"
      onFinish={updateRole}
      autoComplete="off"
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
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input the role title!" }]}
          >
            <Input allowClear placeholder="Enter role title" />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </div>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please input the role description!" },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea allowClear placeholder="Enter role description" rows={3} />
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
        <Form.Item
          label="Permissions"
          name="selectedPermissions"
          rules={[
            {
              validator: (_, value) =>
                value?.length
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("Please select at least one permission!")
                    ),
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <PermissionPicker permissions={permissions} />
        </Form.Item>
      </div>
    </Form>
  );
}
