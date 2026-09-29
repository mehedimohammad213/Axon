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

  const getCvUrl = () => {
    if (mediaList?.cv?.file_path) {
      return `${process.env.NEXT_PUBLIC_MEDIA_URL}/${mediaList.cv.file_path}`;
    }
    return null;
  };

  const handleDownloadCV = () => {
    const cvUrl = getCvUrl();
    if (cvUrl) {
      window.open(cvUrl, "_blank");
    }
  };

  const formatTime = (time) => {
    return moment(time, "HH:mm").format("hh:mm A");
  };

  const dataSource = isValidData
    ? Object.entries(data)
        .filter(([_, value]) => value !== null)
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
                  : String(value),
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
      rootClassName="media-preview-drawer org-form-drawer"
    >
      {isValidData && dataSource.length > 0 ? (
        <div className="space-y-4">
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
            }}
          >
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </div>
          {formType === "career" && mediaList?.cv && (
            <div
              style={{
                border: "1px solid #e8eef5",
                borderRadius: 12,
                padding: 16,
                background: "#ffffff",
              }}
            >
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
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e8eef5",
            borderRadius: 12,
            padding: 24,
            background: "#ffffff",
          }}
        >
          <Empty description="No Details Available" />
        </div>
      )}
    </Drawer>
  );
};

export default ViewDetailsDrawer;
