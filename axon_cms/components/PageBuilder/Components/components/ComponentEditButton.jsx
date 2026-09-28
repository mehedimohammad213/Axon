import React from "react";
import { Button, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";

const ComponentEditButton = ({
  onClick,
  title = "Edit",
  disabled = false,
  className = "",
}) => (
  <Tooltip title={title}>
    <Button
      type="text"
      size="small"
      icon={<EditOutlined />}
      onClick={onClick}
      disabled={disabled}
      className={`!mr-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:!bg-slate-200 hover:!text-slate-800 ${className}`.trim()}
    />
  </Tooltip>
);

export default ComponentEditButton;
