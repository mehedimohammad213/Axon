// components/slider/SliderForm/FormActions.jsx

import React from "react";
import { Button } from "antd";

const FormActions = ({ editingItemId }) => (
  <div className="flex justify-end">
    <Button
      type="primary"
      htmlType="submit"
      className="headlessbutton headlessbutton-pill"
    >
      {editingItemId ? "Update Slider" : "Create Slider"}
    </Button>
  </div>
);

export default FormActions;
