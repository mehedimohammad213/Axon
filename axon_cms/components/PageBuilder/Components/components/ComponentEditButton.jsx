import React from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

const ComponentEditButton = ({
  onClick,
  title = "Edit",
  label = "Edit",
  disabled = false,
  className = "",
}) => (
  <Button
    type="text"
    size="small"
    icon={<EditOutlined />}
    onClick={onClick}
    disabled={disabled}
    aria-label={title}
    className={`headlessbutton headlessbutton-pill !mr-0 ${className}`.trim()}
  >
    {label}
  </Button>
);

export default ComponentEditButton;
