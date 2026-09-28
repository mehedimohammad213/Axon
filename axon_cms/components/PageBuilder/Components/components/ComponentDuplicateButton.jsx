import React from "react";
import { Button, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const ComponentDuplicateButton = ({
  onClick,
  title = "Duplicate",
  disabled = false,
  className = "",
}) => (
  <Tooltip title={title}>
    <Button
      type="text"
      size="small"
      icon={<CopyOutlined />}
      onClick={onClick}
      disabled={disabled}
      className={`!mr-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:!bg-slate-200 hover:!text-slate-800 ${className}`.trim()}
    />
  </Tooltip>
);

export default ComponentDuplicateButton;
