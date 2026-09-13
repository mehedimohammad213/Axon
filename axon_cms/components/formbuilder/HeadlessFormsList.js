import React, { useContext, useEffect, useState } from "react";
import { Drawer, Button, Empty } from "antd";
import { EditOutlined, FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
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
  const router = useRouter();
  const { reset } = useContext(FormBuilderContext);
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    setDrawerVisible(Boolean(selectedFormId));
  }, [selectedFormId]);

  const handleExpand = (formId) => {
    setExpandedFormId((prev) => (prev === formId ? null : formId));
  };

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
    if (expandedFormId === formId) {
      setExpandedFormId(null);
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
              className="mt-2 bg-brand hover:bg-brand-dark"
            >
              {createLabel}
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {forms.map((form) => (
          <FormRow
            key={form.id}
            form={form}
            expandedFormId={expandedFormId}
            handleExpand={handleExpand}
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
        width="60vw"
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              router.push(`/formbuilder/edit-form?id=${selectedFormId}`);
              handleCloseDrawer();
            }}
            className="bg-brand hover:bg-brand-dark"
          >
            Edit Form
          </Button>
        }
      >
        {selectedFormId && (
          <HeadlessFormElements
            formId={selectedFormId}
            setDrawerVisible={setDrawerVisible}
          />
        )}
      </Drawer>
    </div>
  );
};

export default HeadlessFormsList;
