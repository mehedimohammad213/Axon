// components/FormResponses/ViewDetailsDrawer.jsx

import React from "react";
import { Drawer, Table, Empty, Button, Space, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import moment from "moment";

const ViewDetailsDrawer = ({
  visible,
  onClose,
  data,
  mediaList,
  formType,
}) => {
  const isValidData = data && typeof data === "object" && !Array.isArray(data);

  // Function to get CV URL
  const getCvUrl = () => {
    if (mediaList?.cv?.file_path) {
      return `${process.env.NEXT_PUBLIC_MEDIA_URL}/${mediaList.cv.file_path}`;
    }
    return null;
  };

  // Function to handle CV download
  const handleDownloadCV = () => {
    const cvUrl = getCvUrl();
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    }
  };

  // Function to format time to 12-hour format with AM/PM
  const formatTime = (time) => {
    return moment(time, "HH:mm").format("hh:mm A");
  };

  // Convert the form_data object into an array of key-value pairs for the table
  const dataSource = isValidData
    ? Object.entries(data)
        .filter(([_, value]) => value !== null) // Filter out null values
        .map(([key, value], index) => ({
          key: index,
          field: key,
          value:
            key === "callTime" && Array.isArray(value)
              ? `${formatTime(value[0])} - ${formatTime(value[1])}`
              : Array.isArray(value)
                ? value.join(", ")
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value), // Convert all non-null values to string
        }))
    : [];

  const columns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: "30%",
      render: (text) => (
        <strong>
          {text
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </strong>
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          Form Response Details
          {formType && (
            <Tag color={formType === "career" ? "yellow" : "default"}>
              {formType.toUpperCase()}
            </Tag>
          )}
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width="min(720px, 92vw)"
      rootClassName="media-preview-drawer"
    >
      {isValidData && dataSource.length > 0 ? (
        <>
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            rowKey="key"
          />
          {formType === "career" && mediaList?.cv && (
            <div className="mt-4">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadCV}
                className="headlessbutton headlessbutton-pill !mr-0 w-full"
              >
                Download CV
              </Button>
            </div>
          )}
        </>
      ) : (
        <Empty description="No Details Available" />
      )}
    </Drawer>
  );
};

export default ViewDetailsDrawer;
