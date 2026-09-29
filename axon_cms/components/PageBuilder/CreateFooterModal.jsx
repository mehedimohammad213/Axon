import React, { useState, useEffect } from "react";
import { Drawer, Input, Button, Form, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import instance from "../../axios";

const CreateFooterModal = ({
  visible,
  onCancel,
  onFooterCreated,
  fetchPages,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAltTitleManuallyEdited, setIsAltTitleManuallyEdited] =
    useState(false);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setIsAltTitleManuallyEdited(false);
    }
  }, [visible, form]);

  const handleCreateFooter = async (values) => {
    const titleEn = (values.title_en || "").trim();
    const titleBn = (values.title_bn || "").trim();

    if (!titleEn || !titleBn) {
      message.error("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await instance.post("/pages", {
        page_name_en: titleEn,
        page_name_bn: titleBn,
        type: "Footer",
        favicon_id: null,
        slug: null,
        additional: [
          {
            pageType: "Footer",
            metaTitle: titleEn,
            metaDescription: "",
            keywords: [],
            metaImage: "",
            metaImageAlt: "",
          },
        ],
      });

      if (response.status === 201) {
        message.success("Footer created successfully.");
        onFooterCreated(response.data);
        form.resetFields();
        setIsAltTitleManuallyEdited(false);
        fetchPages();
        onCancel();
      } else {
        message.error("Failed to create footer.");
      }
    } catch (error) {
      console.error("Error creating footer:", error);
      message.error("An error occurred while creating the footer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsAltTitleManuallyEdited(false);
    onCancel();
  };

  return (
    <Drawer
      open={visible}
      title={
        <div className="flex items-center gap-2">
          <img
            src="/icons/headless/footer.svg"
            alt="Footer"
            className="w-6"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>Create Footer</span>
        </div>
      }
      onClose={handleCancel}
      placement="right"
      width="min(720px, 92vw)"
      destroyOnClose
      rootClassName="media-preview-drawer org-form-drawer"
      footer={
        <div className="flex w-full justify-end">
          <Button
            type="primary"
            form="create-footer-form"
            htmlType="submit"
            icon={<PlusCircleOutlined />}
            loading={loading}
            className="headlessbutton headlessbutton-pill !mr-0"
          >
            Create Footer
          </Button>
        </div>
      }
    >
      <Form
        id="create-footer-form"
        form={form}
        layout="vertical"
        onFinish={handleCreateFooter}
      >
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              label="Footer Title"
              name="title_en"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input
                placeholder="Enter footer title"
                onChange={(e) => {
                  if (!isAltTitleManuallyEdited) {
                    form.setFieldsValue({ title_bn: e.target.value });
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label="Footer Alt Title"
              name="title_bn"
              rules={[{ required: true, message: "Alt title is required" }]}
            >
              <Input
                placeholder="Enter footer alt title"
                onChange={() => setIsAltTitleManuallyEdited(true)}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default CreateFooterModal;
