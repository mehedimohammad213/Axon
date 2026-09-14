// components/FormResponses/FormResponsesGrid.jsx

import React, { useState } from "react";
import { Card, Button, Popconfirm, Space, message, Tag } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ViewDetailsDrawer from "./ViewDetailsDrawer";
import EditResponseDrawer from "./EditResponseDrawer";
import { getResponseDisplayName } from "./getResponseDisplayName";
import instance from "../../axios";
import moment from "moment";

const FormResponsesGrid = ({ responses, refreshData, currentUser }) => {
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Check if user is admin
  const isAdmin = currentUser?.role_id === "1";

  // Handle Delete Action
  const handleDelete = async (id) => {
    if (!isAdmin) {
      message.error("You don't have permission to delete responses");
      return;
    }

    try {
      const response = await instance.delete(`/form-submission/${id}`);
      if (response.status === 200) {
        message.success("Form response deleted successfully.");
        refreshData();
      } else {
        message.error("Failed to delete the form response.");
      }
    } catch (error) {
      console.error("Error deleting form response:", error);
      message.error("An error occurred while deleting the form response.");
    }
  };

  // Function to render form type tag
  const renderFormTypeTag = (formType) => {
    const tagColors = {
      career: "yellow",
      contact: "green",
      default: "default",
    };

    return (
      <Tag color={tagColors[formType] || tagColors.default}>
        {formType?.toUpperCase() || "UNKNOWN"}
      </Tag>
    );
  };

  // Function to get CV URL
  const getCvUrl = (mediaList) => {
    if (mediaList?.cv?.file_path) {
      return `${process.env.NEXT_PUBLIC_MEDIA_URL}/${mediaList.cv.file_path}`;
    }
    return null;
  };

  // Function to handle CV download
  const handleDownloadCV = (mediaList) => {
    const cvUrl = getCvUrl(mediaList);
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    } else {
      message.error("CV file not available");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {responses.map((response) => (
          <div key={response.id}>
            <Card
              className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-shadow hover:border-gray-300 hover:shadow-md"
              title={
                <Space>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    #{response.id}
                  </span>
                  {renderFormTypeTag(response.form_type)}
                </Space>
              }
              bordered={false}
              extra={
                response.form_type === "career" &&
                response.media_list?.cv && (
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadCV(response.media_list)}
                    style={{ padding: 0 }}
                  >
                    CV
                  </Button>
                )
              }
              actions={[
                <EyeOutlined
                  key="view"
                  onClick={() => {
                    setSelectedResponse(response);
                    setViewDrawerVisible(true);
                  }}
                />,
                isAdmin && (
                  <EditOutlined
                    key="edit"
                    onClick={() => {
                      setSelectedResponse(response);
                      setEditDrawerVisible(true);
                    }}
                  />
                ),
                isAdmin && (
                  <Popconfirm
                    title="Are you sure you want to delete this response?"
                    onConfirm={() => handleDelete(response.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <DeleteOutlined key="delete" style={{ color: "red" }} />
                  </Popconfirm>
                ),
              ].filter(Boolean)}
            >
              <p>
                <strong>Name:</strong>{" "}
                {getResponseDisplayName(response.form_data) || "N/A"}
              </p>
              {response.form_type === "career" && (
                <p>
                  <strong>Position:</strong> {response.form_data?.type || "N/A"}
                </p>
              )}
              <p style={{ marginBottom: 0 }}>
                <strong>Submitted:</strong>{" "}
                {new Date(response.created_at).toLocaleDateString()}
              </p>
            </Card>
          </div>
        ))}
      </div>

      {/* View Details Drawer */}
      <ViewDetailsDrawer
        visible={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        data={selectedResponse?.form_data}
        mediaList={selectedResponse?.media_list}
        formType={selectedResponse?.form_type}
        currentUser={currentUser}
        onEdit={() => {
          setViewDrawerVisible(false);
          setEditDrawerVisible(true);
        }}
      />

      {/* Edit Response Drawer */}
      {isAdmin && (
        <EditResponseDrawer
          visible={editDrawerVisible}
          onClose={() => setEditDrawerVisible(false)}
          data={selectedResponse}
          onUpdate={refreshData}
        />
      )}
    </>
  );
};

export default FormResponsesGrid;
