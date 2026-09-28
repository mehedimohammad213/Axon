import { Form, Input, Switch, message } from "antd";
import instance from "../../axios";
import PermissionPicker from "../rolepermission/role/PermissionPicker";

export default function OrgCreateRole({
  organizationId,
  permissions,
  setModalVisible,
  fetchRoles,
  formId = "create-role-form",
  onLoadingChange,
}) {
  const [form] = Form.useForm();

  const createRole = async (values) => {
    onLoadingChange?.(true);
    const { title, description, status, selectedPermissions } = values;

    try {
      const response = await instance.post(
        `/organizations/${organizationId}/roles`,
        {
          title,
          description,
          status: status ? 1 : 0,
          permission_ids: selectedPermissions,
        }
      );

      if (response.status === 201) {
        message.success("Role created successfully!");
        form.resetFields();
        fetchRoles();
        setModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred while creating the role.");
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <Form
      id={formId}
      form={form}
      name="create_org_role"
      layout="vertical"
      onFinish={createRole}
      autoComplete="off"
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: "Please input the role title!" }]}
      >
        <Input allowClear placeholder="Enter role title" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: "Please input the role description!" },
        ]}
      >
        <Input.TextArea allowClear placeholder="Enter role description" />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        valuePropName="checked"
        initialValue
      >
        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
      </Form.Item>

      <Form.Item
        label="Permissions"
        name="selectedPermissions"
        initialValue={[]}
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
      >
        <PermissionPicker permissions={permissions} />
      </Form.Item>
    </Form>
  );
}
