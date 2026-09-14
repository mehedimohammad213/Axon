// components/PageBuilder/Components/ButtonComponent.jsx

import React, { useState, useEffect } from "react";
import { Button, Typography, message, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CopyFilled,
  DragOutlined,
} from "@ant-design/icons";
import ButtonSelectionModal from "../Modals/ButtonSelectionModal/ButtonSelectionModal";
import { useRouter } from "next/router";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";

const { Paragraph } = Typography;

const hasConfiguredButton = (button) => Boolean(button?.text);

const ButtonComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  // Safety check for null component
  if (!component) {
    return null;
  }

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [buttonData, setButtonData] = useState(
    hasConfiguredButton(component?._headless) ? component._headless : {}
  );
  const router = useRouter();

  useEffect(() => {
    setButtonData(
      hasConfiguredButton(component?._headless) ? component._headless : {}
    );
  }, [component?._headless]);

  const handleSelectButton = (newButtonData) => {
    updateComponent({
      ...component,
      _headless: newButtonData,
      id: component._id,
    });
    setButtonData(newButtonData);
    setIsModalVisible(false);
    message.success("Button updated successfully.");
  };

  const handleDelete = () => {
    deleteComponent();
  };

  const handleButtonClick = () => {
    if (buttonData.action?.type === "internal_link" && buttonData.action.url) {
      router.push(buttonData.action.url);
    } else if (
      buttonData.action?.type === "external_link" &&
      buttonData.action.url
    ) {
      window.open(buttonData.action.url, "_blank");
    } else if (
      buttonData.action?.type === "action" &&
      buttonData.action.customScript
    ) {
      try {
        // eslint-disable-next-line no-eval
        eval(buttonData.action.customScript);
      } catch (error) {
        message.error("Error executing custom script.");
      }
    }
  };

  const getButtonIcon = () => {
    if (buttonData.icon) {
      const IconComponent = require("@ant-design/icons")[buttonData.icon];
      return IconComponent ? <IconComponent /> : null;
    }
    return null;
  };

  const renderConfiguredButtons = () => {
    if (!hasConfiguredButton(buttonData)) {
      return (
        <div className="flex justify-center items-center p-8">
          <Button
            className="headlessbutton"
            type="primary"
            onClick={() => setIsModalVisible(true)}
            size="large"
          >
            Choose Button
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-2">
        <Button
          type="primary"
          size="large"
          className="headlessbutton !mr-0 inline-flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
          icon={getButtonIcon()}
          onClick={handleButtonClick}
          aria-label={buttonData.text}
        >
          {buttonData.text}
        </Button>
        {buttonData.showAltText && buttonData.altText && (
          <Button
            type="default"
            size="large"
            className="headlessbutton-warning !mr-0 inline-flex min-h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold"
            icon={getButtonIcon()}
            onClick={handleButtonClick}
            aria-label={buttonData.altText}
          >
            {buttonData.altText}
          </Button>
        )}
      </div>
    );
  };

  if (preview) {
    return (
      <div className="preview-button-component rounded-lg bg-white p-4">
        {hasConfiguredButton(buttonData) ? (
          renderConfiguredButtons()
        ) : (
          <Paragraph className="!mb-0 text-slate-500">
            No button configured.
          </Paragraph>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
            <DragOutlined />
          </span>
          <h3 className="text-base font-semibold text-slate-800">
            Button Component
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasConfiguredButton(buttonData) && (
            <ComponentEditButton
              onClick={() => setIsModalVisible(true)}
              title="Edit button"
            />
          )}
          <ComponentDuplicateButton
            onClick={onDuplicateElement}
            title="Duplicate component"
          />
          <ComponentDeleteButton
            onConfirm={handleDelete}
            title="Delete component"
            confirmTitle="Are you sure you want to delete this button?"
          />
        </div>
      </div>

      <div className="p-4 sm:p-5">{renderConfiguredButtons()}</div>

      <ButtonSelectionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelectButton={handleSelectButton}
        initialButton={buttonData}
      />
    </div>
  );
};

export default ButtonComponent;
