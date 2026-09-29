// components/formbuilder/ElementsParser.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { message } from "antd";
import instance from "../../axios";

function getFieldName(element) {
  if (element?.name) return element.name;
  if (element?.label) return String(element.label).toLowerCase().replace(/\s+/g, "_");
  return `field_${element?.updated_on || "unknown"}`;
}

function getElementType(element) {
  return element?.element_type || element?.type;
}

function getRegisterOptions(element) {
  const options = {
    required: element.required ? `${element.label || "This field"} is required` : false,
  };

  if (element.input_type === "email") {
    options.pattern = {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    };
  }

  return options;
}

// A simpler "DisplayField" w/o drag-and-drop
function DisplayField({ element, register, errors }) {
  const fieldName = getFieldName(element);

  switch (getElementType(element)) {
    case "input":
      if (element.input_type === "radio") {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {element.options?.map((opt, idx) => (
                <label key={idx} className="flex items-center">
                  <input
                    type="radio"
                    value={opt.value}
                    {...register(fieldName, getRegisterOptions(element))}
                    className="mr-2"
                  />
                  {opt.title}
                </label>
              ))}
            </div>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldName].message}</p>
            )}
          </div>
        );
      }
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={element.input_type}
            placeholder={element.placeholder}
            {...register(fieldName, getRegisterOptions(element))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors[fieldName] && (
            <p className="text-red-500 text-sm mt-1">{errors[fieldName].message}</p>
          )}
        </div>
      );
    case "textarea":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            rows={3}
            placeholder={element.placeholder}
            {...register(fieldName, getRegisterOptions(element))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors[fieldName] && (
            <p className="text-red-500 text-sm mt-1">{errors[fieldName].message}</p>
          )}
        </div>
      );
    case "select":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            {...register(fieldName, getRegisterOptions(element))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{element.placeholder || "Select an option"}</option>
            {element.options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </select>
          {errors[fieldName] && (
            <p className="text-red-500 text-sm mt-1">{errors[fieldName].message}</p>
          )}
        </div>
      );
    case "button":
      if (element.input_type === "submit") {
        return (
          <button
            type="submit"
            className="bg-theme text-white px-6 py-2 rounded-md hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-theme"
          >
            {element.placeholder || element.label || "Submit"}
          </button>
        );
      }
      return (
        <button
          type="button"
          className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {element.placeholder || element.label || "Button"}
        </button>
      );
    default:
      return null;
  }
}

export default function ElementsParser({ form, setDrawerVisible }) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const formId = form?.id;

  const onSubmit = async (values) => {
    if (!formId) {
      message.error("This form cannot be submitted yet.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await instance.post("/form-submission", {
        form_id: formId,
        form_type: form?.title || null,
        form_data: values,
      });
      if (response.status === 201 || response.status === 200) {
        message.success("Form submitted successfully!");
        reset();
        setDrawerVisible?.(false);
      } else {
        message.error("Error submitting form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(
        error?.response?.data?.message ||
          "An error occurred while submitting the form."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => reset();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form
        id={form?.attributes?.component_id}
        className={form?.attributes?.component_class}
        encType={form?.attributes?.enctype}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{form?.title}</h3>
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: form?.description }}
          />
        </div>

        <div className="space-y-6">
          {/* Render form elements */}
          {form?.elements?.map((element, idx) => (
            <div key={element.updated_on || idx}>
              <DisplayField
                element={element}
                register={register}
                errors={errors}
              />
            </div>
          ))}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm font-medium">
              Please fix the validation errors above.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-theme text-white px-6 py-2 rounded-md hover:bg-theme-dark focus:outline-none focus:ring-2 focus:ring-theme disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Form"}
          </button>
        </div>
      </form>
    </div>
  );
}
