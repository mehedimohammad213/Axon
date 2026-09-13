import React from "react";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  CopyFilled,
  DragOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import ComponentEditButton from "../components/ComponentEditButton";
import ComponentDuplicateButton from "../components/ComponentDuplicateButton";
import ComponentDeleteButton from "../components/ComponentDeleteButton";

const SliderActions = React.memo(
  ({
    sliderData,
    isEditing,
    selectedSliderData,
    isRefreshing,
    pollingError,
    onRefresh,
    onEdit,
    onDuplicate,
    onDelete,
    onSubmit,
    onCancel,
  }) => {
    const handleDelete = () => {
      onDelete();
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DragOutlined className="text-2xl border rounded-md p-1" />
          <h3 className="text-xl font-semibold">Slider Component</h3>
          {sliderData && (
            <div className="flex items-center gap-2 ml-4">
              <Tooltip title="Refresh slider data">
                <Button
                  icon={<ReloadOutlined spin={isRefreshing} />}
                  onClick={onRefresh}
                  disabled={isRefreshing || !sliderData?.id}
                  size="small"
                  className="headlessbutton"
                />
              </Tooltip>
              {pollingError && (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  {pollingError}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Space>
              {sliderData && (
                <ComponentEditButton onClick={onEdit} title="Edit slider" />
              )}
              <ComponentDuplicateButton
                onClick={onDuplicate}
                title="Duplicate component"
              />
              <ComponentDeleteButton
                onConfirm={handleDelete}
                title="Delete component"
                confirmTitle="Are you sure you want to delete this component?"
              />
            </Space>
          ) : (
            <Space>
              <Tooltip title="Save Changes">
                <Button
                  icon={<CheckOutlined />}
                  onClick={onSubmit}
                  className="headlessbutton"
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <Button
                  icon={<CloseOutlined />}
                  onClick={onCancel}
                  className="headlesscancelbutton"
                />
              </Tooltip>
            </Space>
          )}
        </div>
      </div>
    );
  }
);

SliderActions.displayName = "SliderActions";

export default SliderActions;
