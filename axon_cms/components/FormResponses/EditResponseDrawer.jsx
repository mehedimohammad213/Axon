// components/FormResponses/EditResponseDrawer.jsx

import React, { useEffect } from "react";
import { Drawer, Form, Button, Input, message, Empty } from "antd";
import instance from "../../axios";
import RichTextEditor from "../RichTextEditor";

const EditResponseDrawer = ({ visible, onClose, data, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && data.form_data && typeof data.form_data === "object") {
      form.setFieldsValue(data.form_data);
    } else {
      form.resetFields();
    }
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      const response = await instance.put(`/form-submission/${data.id}`, {
        form_data: values,
      });

      if (response.status === 200) {
        message.success("Form response updated successfully.");
        onUpdate();
        onClose();
      } else {
        message.error("Failed to update the form response.");
      }
    } catch (error) {
      console.error("Error updating form response:", error);
      message.error("An error occurred while updating the form response.");
    }
  };

  if (!data || !data.form_data || typeof data.form_data !== "object") {
    return (
      <Drawer
        title="Edit Form Response"
        width="min(720px, 92vw)"
        onClose={onClose}
        open={visible}
        rootClassName="media-preview-drawer org-form-drawer"
      >
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 24,
            background: "#ffffff",
          }}
        >
          <Empty description="No Data Available for Editing" />
        </div>
      </Drawer>
    );
  }

  const entries = Object.entries(data.form_data);

  return (
    <Drawer
      title="Edit Form Response"
      width="min(720px, 92vw)"
      onClose={onClose}
      open={visible}
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      footer={
        <div className="flex w-full justify-end">
          <Button
            type="primary"
            className="headlessbutton headlessbutton-pill !mr-0"
            onClick={() => form.submit()}
          >
            Update Response
          </Button>
        </div>
      }
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="grid gap-x-4 md:grid-cols-2">
            {entries.map(([key, value]) => {
              const isComplex =
                Array.isArray(value) ||
                (typeof value === "object" && value !== null);

              return (
                <Form.Item
                  key={key}
                  name={key}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  rules={[
                    {
                      required: true,
                      message: `Please enter ${key.replace(/_/g, " ")}`,
                    },
                  ]}
                  className={isComplex ? "md:col-span-2" : undefined}
                >
                  {isComplex ? (
                    <RichTextEditor
                      defaultValue={
                        Array.isArray(value)
                          ? JSON.stringify(value)
                          : JSON.stringify(value)
                      }
                      onChange={(html) => form.setFieldValue(key, html)}
                      editMode={true}
                      maxLength={2000}
                    />
                  ) : (
                    <Input placeholder={`Enter ${key.replace(/_/g, " ")}`} />
                  )}
                </Form.Item>
              );
            })}
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default EditResponseDrawer;
