// components/formbuilder/builder/FormEditor.js
import React, { useEffect, useState, useContext } from "react";
import { Tabs, Card, Button, Popconfirm } from "antd";
import { CopyOutlined, CloseOutlined } from "@ant-design/icons";
import BuilderPanel from "./BuilderPanel";
import ElementPanel from "./ElementPanel";
import { FormBuilderContext } from "../../../src/context/FormBuilderContext";
import { message } from "antd";
import instance from "../../../axios";
import { useRouter } from "next/router";
import RichTextEditor from "../../RichTextEditor";
import { copyApiEndpoint, getApiBaseUrl } from "../../../utils/copyApiEndpoint";

const { TabPane } = Tabs;

const FormEditor = ({ formId }) => {
  const [formElements, setFormElements] = useState([]);
  const [formAttributes, setFormAttributes] = useState({});
  const [formMeta, setFormMeta] = useState({});
  const [loading, setLoading] = useState(false);

  const { reset } = useContext(FormBuilderContext);
  const router = useRouter();

  const loadForm = async () => {
    if (!formId) return;
    try {
      const response = await instance.get(`/form_builder/${formId}`);
      const form = response.data;
      setFormAttributes(form.attributes);
      setFormMeta({
        title: form.title,
        description: form.description,
        status: form.status,
      });
      setFormElements(form.elements);
    } catch (error) {
      console.error("Error loading form:", error);
    }
  };

  useEffect(() => {
    if (formId) {
      loadForm();
    } else {
      setFormAttributes({
        component_id: "dummy_form",
        component_class: "form bg-white p-6 rounded shadow-md",
        method: "POST",
        action_url: "", // Initially blank, will be set after form creation
        enctype: "multipart/form-data",
      });
      setFormMeta({
        title: "Demo Form",
        description: "<p>This is a demo form.</p>",
        status: 1,
      });
    }
  }, [formId]);

  const addElement = (element) => {
    setFormElements((prev) => [
      ...prev,
      { ...element, updated_on: new Date().getTime().toString() },
    ]);
  };

  const updateElement = (elements) => {
    setFormElements(elements);
  };

  const saveForm = async () => {
    try {
      setLoading(true);

      // If creating new form, ensure action URL is set automatically
      let attributes = formAttributes;
      if (!formId) {
        attributes = {
          ...formAttributes,
          action_url: `${getApiBaseUrl()}/form-submission`
        };
      }

      const data = {
        title: formMeta.title,
        description: formMeta.description,
        attributes: attributes,
        elements: formElements,
      };
      const url = formId ? `/form_builder/${formId}` : "/form_builder";
      const method = formId ? "put" : "post";

      const response = await instance[method](url, data);
      if (response.status === 200 || response.status === 201) {
        // If creating new form, update with form ID in action URL
        if (!formId && response.data.id) {
          const newFormId = response.data.id;
          const updatedAttributes = {
            ...attributes,
            action_url: `${getApiBaseUrl()}/form-submission?form_id=${newFormId}`
          };

          await instance.put(`/form_builder/${newFormId}`, {
            ...data,
            attributes: updatedAttributes
          });
        }

        message.success("Form saved successfully!");
        reset();
        router.push("/formbuilder");
      } else {
        message.error("Failed to save form.");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      message.error("Error saving form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">Edit Form</h1>
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
              <label className="block text-gray-700 font-bold mb-2">
                Form Title
              </label>
              <input
                className="border rounded w-full p-2 mb-4"
                placeholder="Form Title"
                value={formMeta.title}
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
              <label className="block text-gray-700 font-bold mb-2">
                Form Description
              </label>
              {/* <textarea
                className="border rounded w-full p-2 mb-4"
                rows="4"
                value={formMeta.description.replace(/<[^>]+>/g, "")}
                onChange={(e) =>
                  setFormMeta({
                    ...formMeta,
                    description: `<p>${e.target.value}</p>`,
                  })
                }
              /> */}
              <RichTextEditor
                editMode={true}
                defaultValue={formMeta.description}
                value={formMeta.description}
                onChange={(value) =>
                  setFormMeta({ ...formMeta, description: value })
                }
              />
              <label className="block text-gray-700 font-bold mb-2">
                Action URL <span className="text-sm text-gray-500">(Auto-generated)</span>
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  className="border rounded w-full p-2 bg-gray-100 cursor-not-allowed"
                  type="url"
                  placeholder={formId ? "Action URL will appear after form creation" : "Save form to generate Action URL"}
                  value={formAttributes.action_url || ""}
                  readOnly
                  disabled
                />
                {(formAttributes.action_url || formId) && (
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() =>
                      copyApiEndpoint(
                        formAttributes.action_url ||
                          `/form-submission?form_id=${formId}`,
                        {
                          successMessage: "Form submission API endpoint copied",
                        }
                      )
                    }
                  >
                    Copy
                  </Button>
                )}
              </div>
              {!formId && (
                <p className="text-sm text-gray-500 mb-4">
                  💡 The Action URL will be automatically generated after you save the form.
                </p>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>
      <div className="lg:col-span-1">
        <ElementPanel />
      </div>
    </div>
    </div>
  );
};

export default FormEditor;
