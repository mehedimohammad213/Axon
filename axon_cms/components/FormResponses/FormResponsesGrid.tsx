import React, { useState } from "react";
import { Empty, message } from "antd";
import { FormOutlined } from "@ant-design/icons";
import FormResponseRow from "./FormResponseRow";
import ViewDetailsDrawer from "./ViewDetailsDrawer";
import EditResponseDrawer from "./EditResponseDrawer";
import instance from "../../axios";

const FormResponsesGrid = ({
  responses,
  refreshData,
  emptyTitle = "No responses yet",
  emptyDescription = "Submitted form responses will appear here.",
}) => {
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  const handleView = (response) => {
    setSelectedResponse(response);
    setViewDrawerVisible(true);
  };

  const handleEdit = (response) => {
    setSelectedResponse(response);
    setEditDrawerVisible(true);
  };

  const handleDelete = async (id) => {
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

  const handleToggleStatus = async (record) => {
    const currentStatus = String(record?.status || "pending").toLowerCase();
    const newStatus = currentStatus === "pending" ? "resolved" : "pending";

    try {
      const response = await instance.put(`/form-submission/${record.id}`, {
        status: newStatus,
      });
      if (response.status === 200) {
        message.success(`Form response marked as ${newStatus}.`);
        refreshData();
      } else {
        message.error("Failed to update the form response status.");
      }
    } catch (error) {
      console.error("Error updating form response status:", error);
      message.error("An error occurred while updating the form response status.");
    }
  };

  if (!responses.length) {
    return (
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <FormOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">{emptyTitle}</p>
              <p className="text-sm text-gray-500">{emptyDescription}</p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 media-content-card">
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {responses.map((response) => (
            <FormResponseRow
              key={response.id}
              response={response}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      </div>

      <ViewDetailsDrawer
        visible={viewDrawerVisible}
        onClose={() => setViewDrawerVisible(false)}
        data={selectedResponse?.form_data}
        mediaList={selectedResponse?.media_list}
        formType={selectedResponse?.form_type}
      />

      <EditResponseDrawer
        visible={editDrawerVisible}
        onClose={() => setEditDrawerVisible(false)}
        data={selectedResponse}
        onUpdate={refreshData}
      />
    </>
  );
};

export default FormResponsesGrid;
