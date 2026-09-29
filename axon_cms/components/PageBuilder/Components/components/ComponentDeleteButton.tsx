import React from "react";
import { Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const ComponentDeleteButton = ({
  onConfirm,
  title = "Delete",
  label = "Delete",
  confirmTitle = "Delete component?",
  confirmDescription = undefined,
  okText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  className = "",
  stopPropagation = false,
}: {
  onConfirm: any;
  title?: string;
  label?: string;
  confirmTitle?: string;
  confirmDescription?: any;
  okText?: string;
  cancelText?: string;
  disabled?: boolean;
  className?: string;
  stopPropagation?: boolean;
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
      <Button
        type="text"
        size="small"
        icon={<DeleteOutlined />}
        onClick={handleClick}
        disabled={disabled}
        aria-label={title}
        className={`headlesscancelbutton headlessbutton-pill !mr-0 shrink-0 ${className}`.trim()}
      >
        {label}
      </Button>
    </Popconfirm>
  );
};

export default ComponentDeleteButton;
