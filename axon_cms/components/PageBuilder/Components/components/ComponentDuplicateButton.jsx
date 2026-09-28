import React from "react";
import { Button } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const ComponentDuplicateButton = ({
  onClick,
  title = "Duplicate",
  label = "Duplicate",
  disabled = false,
  className = "",
}) => (
  <Button
    type="text"
    size="small"
    icon={<CopyOutlined />}
    onClick={onClick}
    disabled={disabled}
    aria-label={title}
    className={`!mr-0 inline-flex h-8 items-center rounded-full px-3 text-slate-500 hover:!bg-slate-200 hover:!text-slate-800 ${className}`.trim()}
  >
    {label}
  </Button>
);

export default ComponentDuplicateButton;
