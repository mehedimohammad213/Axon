import React from "react";
import { Button, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const ComponentDeleteButton = ({
  onConfirm,
  title = "Delete",
  confirmTitle = "Delete component?",
  confirmDescription,
  okText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  className = "",
  stopPropagation = false,
}) => {
  const handleClick = (e) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Popconfirm
      title={confirmTitle}
      description={confirmDescription}
      onConfirm={onConfirm}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger: true }}
    >
      <Tooltip title={title}>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleClick}
          disabled={disabled}
          className={`headlesscancelbutton !mr-0 shrink-0 ${className}`.trim()}
        />
      </Tooltip>
    </Popconfirm>
  );
};

export default ComponentDeleteButton;
