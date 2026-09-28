// components/formbuilder/builder/FormBuilder.js
import React, { useState, useEffect } from "react";
import { Tabs, Card, Button, Popconfirm, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import instance from "../../../axios";
import BuilderPanel from "./BuilderPanel";
import ElementPanel from "./ElementPanel";
import { getApiBaseUrl } from "../../../utils/copyApiEndpoint";

const { TabPane } = Tabs;

const FormBuilder = () => {
  const [formElements, setFormElements] = useState([]);
  const [formAttributes, setFormAttributes] = useState({});
  const [formMeta, setFormMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [createdFormId, setCreatedFormId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize default form attributes
    setFormAttributes({
      component_id: "dummy_form",
      component_class: "form, bg-light",
      method: "POST",
      action_url: "", // Initially blank, will be set after form creation
      enctype: "multipart/form-data",
    });
    setFormMeta({
      title: "Demo Form",
      description: "This is a demo form.",
      status: 1,
    });
  }, []);

  // Add new element from side panel
  const addElement = (element) => {
    setFormElements((prev) => [
      ...prev,
      { ...element, updated_on: Date.now().toString() },
    ]);
  };

  // Overwrite entire array of elements
  const updateElement = (newElements) => {
    setFormElements(newElements);
  };

  // Save form to server
  const saveForm = async () => {
    try {
      setLoading(true);
      const response = await instance.post("/form_builder", {
        title: formMeta.title,
        description: formMeta.description,
        attributes: formAttributes,
        elements: formElements,
      });
      if (response.status === 201) {
        const formId = response.data.id;
        // Auto-update action URL with form ID
        const updatedAttributes = {
          ...formAttributes,
          action_url: `${getApiBaseUrl()}/form-submission?form_id=${formId}`
        };

        // Update the form with the correct action URL
        await instance.put(`/form_builder/${formId}`, {
          title: formMeta.title,
          description: formMeta.description,
          attributes: updatedAttributes,
          elements: formElements,
        });

        // Update local state with the new action URL
        setFormAttributes(updatedAttributes);
        setCreatedFormId(formId);

        message.success("Form saved successfully with auto-generated action URL!");
        await router.push("/formbuilder");
      } else {
        message.error("Failed to save form.");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      message.error("Error saving form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Create Form</h1>
        <button
          type="button"
          onClick={() => router.push("/formbuilder")}
          aria-label="Back to form list"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--danger-light)] text-[var(--danger)] transition-colors hover:text-[var(--danger-dark)]"
        >
          <CloseOutlined />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-4">
        <Tabs defaultActiveKey="1" type="card" size="large" centered>
          <TabPane tab="Builder" key="1">
            <BuilderPanel
              formElements={formElements}
              addElement={addElement}
              updateElement={updateElement}
            />
            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  className="headlessbutton headlessbutton-pill !mr-0"
                  onClick={saveForm}
                  loading={loading}
                >
                  Publish
                </Button>
              </div>
              <Popconfirm
                title="Are you sure you want to clear the form?"
                onConfirm={() => setFormElements([])}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button danger className="headlesscancelbutton headlessbutton-pill !mr-0">
                  Clear Form
                </Button>
              </Popconfirm>
            </div>
          </TabPane>

          <TabPane tab="Attributes" key="2">
            <Card className="mb-4">
              {/* Title */}
              <label className="block text-gray-700 font-bold mb-2">
                Form Title
              </label>
              <input
                className="border rounded w-full p-2 mb-4"
                placeholder="Form Title"
                value={formMeta.title || ""}
                onChange={(e) => {
                  setFormMeta({ ...formMeta, title: e.target.value });
                  setFormAttributes({
                    ...formAttributes,
                    component_id: e.target.value
                      .toLowerCase()
                      .replace(/\s/g, "_"),
                  });
                }}
              />
              {/* Description */}
              <label className="block text-gray-700 font-bold mb-2">
                Form Description
              </label>
              <textarea
                className="border rounded w-full p-2 mb-4"
                rows="4"
                value={
                  formMeta.description
                    ? formMeta.description.replace(/<[^>]+>/g, "")
                    : ""
                }
                onChange={(e) =>
                  setFormMeta({
                    ...formMeta,
                    description: `<p>${e.target.value}</p>`,
                  })
                }
              />
              {/* Action URL - Read Only */}
              <label className="block text-gray-700 font-bold mb-2">
                Action URL <span className="text-sm text-gray-500">(Auto-generated)</span>
              </label>
              <input
                className="border rounded w-full p-2 mb-4 bg-gray-100 cursor-not-allowed"
                type="url"
                placeholder={createdFormId ? "Action URL will appear after form creation" : "Save form to generate Action URL"}
                value={formAttributes.action_url || ""}
                readOnly
                disabled
              />
              {!createdFormId && (
                <p className="text-sm text-gray-500 mb-4">
                  💡 The Action URL will be automatically generated after you save the form.
                </p>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* Side Panel */}
      <div className="lg:col-span-1">
        <ElementPanel />
      </div>
      </div>
    </div>
  );
};

export default FormBuilder;
