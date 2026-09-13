// components/slider/SliderForm/FormActions.jsx

import React from "react";
import { Space, Button, Form } from "antd";

const FormActions = ({ editingItemId, onCancelEdit }) => (
  <Form.Item>
    <Space>
      <Button htmlType="submit" className="headlessbutton">
        {editingItemId ? "Update Slider" : "Create Slider"}
      </Button>
      {editingItemId && (
        <Button className="headlesscancelbutton" onClick={onCancelEdit}>
          Discard
        </Button>
      )}
    </Space>
  </Form.Item>
);

export default FormActions;
