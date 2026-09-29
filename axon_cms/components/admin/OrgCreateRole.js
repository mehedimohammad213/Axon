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

          <Form.Item
            label="Status"
            name="status"
            valuePropName="checked"
            initialValue
          >
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
          style={{ marginBottom: 0 }}
        >
          <PermissionPicker permissions={permissions} />
        </Form.Item>
      </div>
    </Form>
  );
}
