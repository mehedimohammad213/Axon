// components/slider/SliderForm/BasicInfoForm.jsx

import React from "react";
import { Form, Input } from "antd";
import RichTextEditor from "../../RichTextEditor";

const BasicInfoForm = ({ form }) => (
  <>
    <div className="grid gap-x-4 md:grid-cols-2">
      <Form.Item
        label="Title English"
        name="title_en"
        rules={[
          { required: true, message: "Please enter the title in English." },
        ]}
      >
        <Input placeholder="Enter title in English" />
      </Form.Item>

      <Form.Item
        label="Title Bangla"
        name="title_bn"
        rules={[
          { required: true, message: "Please enter the title in Bangla." },
        ]}
      >
        <Input placeholder="Enter title in Bangla" />
      </Form.Item>
    </div>

    <Form.Item
      label="Description English"
      name="description_en"
      rules={[
        {
          required: true,
          message: "Please enter the description in English.",
        },
      ]}
    >
      <RichTextEditor
        editMode={true}
        defaultValue={form.getFieldValue("description_en") || ""}
      />
    </Form.Item>

    <Form.Item
      label="Description Bangla"
      name="description_bn"
      rules={[
        {
          required: true,
          message: "Please enter the description in Bangla.",
        },
      ]}
    >
      <RichTextEditor
        editMode={true}
        defaultValue={form.getFieldValue("description_bn") || ""}
      />
    </Form.Item>
  </>
);

export default BasicInfoForm;
