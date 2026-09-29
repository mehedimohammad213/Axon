import React, { useContext, useEffect, useState } from "react";
import { Drawer, Button, Empty } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import HeadlessFormElements from "./HeadlessFormElements";
import FormRow from "./FormRow";
import { FormBuilderContext } from "../../src/context/FormBuilderContext";

const HeadlessFormsList = ({
  forms,
  onDeleteForm,
  onCreate,
  emptyTitle = "No forms yet",
  emptyDescription = "Create a form to collect submissions from your site.",
  createLabel = "Create form",
}) => {
  const { reset } = useContext(FormBuilderContext);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    setDrawerVisible(Boolean(selectedFormId));
  }, [selectedFormId]);

  const handlePreview = (formId) => {
    setSelectedFormId(formId);
  };

  const handleCloseDrawer = () => {
    setSelectedFormId(null);
    setDrawerVisible(false);
  };

  const handleDelete = async (formId) => {
    await onDeleteForm(formId);
    if (selectedFormId === formId) {
      handleCloseDrawer();
      reset();
    }
  };

  if (!forms.length) {
    return (
      <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
        <Empty
          image={
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
              <FileTextOutlined />
            </div>
          }
          description={
            <div className="space-y-1">
              <p className="text-base font-medium text-gray-800">{emptyTitle}</p>
              <p className="text-sm text-gray-500">{emptyDescription}</p>
            </div>
          }
        >
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
              className="headlessbutton headlessbutton-pill !mr-0 mt-2"
            >
              {createLabel}
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 media-content-card">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {forms.map((form) => (
          <FormRow
            key={form.id}
            form={form}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-brand-dark" />
            <span>Form Preview</span>
          </div>
        }
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width="min(800px, 92vw)"
        rootClassName="media-preview-drawer org-form-drawer"
      >
        {selectedFormId && (
          <div
            style={{
              border: "1px solid #e8eef5",
              borderRadius: 12,
              padding: 16,
              background: "#ffffff",
            }}
          >
            <HeadlessFormElements
              formId={selectedFormId}
              setDrawerVisible={setDrawerVisible}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HeadlessFormsList;
