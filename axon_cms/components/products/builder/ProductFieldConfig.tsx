import React, { useEffect, useState } from "react";
import { Button, Input, InputNumber, Select, Switch } from "antd";

const OPTION_FIELD_TYPES = ["select", "radio", "multiselect"];
const NO_PLACEHOLDER_TYPES = [
  "media",
  "file",
  "gallery",
  "checkbox",
  "toggle",
  "rating",
  "color",
  "location",
  "range",
];

const CURRENCY_OPTIONS = [
  { label: "BDT", value: "BDT" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "INR", value: "INR" },
];

const ProductFieldConfig = ({ field, onUpdate }) => {
  const [label, setLabel] = useState(field.label || "");
  const [name, setName] = useState(field.name || "");
  const [placeholder, setPlaceholder] = useState(field.placeholder || "");
  const [required, setRequired] = useState(!!field.required);
  const [showInList, setShowInList] = useState(field.show_in_list !== false);
  const [options, setOptions] = useState(field.options || []);
  const [currency, setCurrency] = useState(field.currency || "BDT");
  const [min, setMin] = useState(field.min ?? 0);
  const [max, setMax] = useState(field.max ?? 100);
  const [step, setStep] = useState(field.step ?? 1);
  const [maxRating, setMaxRating] = useState(field.max_rating ?? 5);
  const [divisionLabel, setDivisionLabel] = useState(
    field.division_label || "Select Division"
  );
  const [districtLabel, setDistrictLabel] = useState(
    field.district_label || "Select District"
  );

  useEffect(() => {
    onUpdate({
      ...field,
      label,
      name,
      placeholder,
      required,
      show_in_list: showInList,
      options,
      currency,
      min,
      max,
      step,
      max_rating: maxRating,
      division_label: divisionLabel,
      district_label: districtLabel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    label,
    name,
    placeholder,
    required,
    showInList,
    options,
    currency,
    min,
    max,
    step,
    maxRating,
    divisionLabel,
    districtLabel,
  ]);

  const addOption = () => {
    setOptions((prev) => [...prev, { label: "", value: "" }]);
  };

  const updateOption = (index, patch) => {
    setOptions((prev) =>
      prev.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <label className="block font-semibold mb-1">Required Field?</label>
      <Switch
        checked={required}
        onChange={setRequired}
        className="mb-4"
        checkedChildren="Yes"
        unCheckedChildren="No"
      />

      <label className="block font-semibold mb-1">Show in product list?</label>
      <Switch
        checked={showInList}
        onChange={setShowInList}
        className="mb-4"
        checkedChildren="Yes"
        unCheckedChildren="No"
      />

      <label className="block font-semibold mb-1">Label</label>
      <Input
        className="mb-4"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <label className="block font-semibold mb-1">Field Name</label>
      <Input
        className="mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="machine_key"
      />

      {!NO_PLACEHOLDER_TYPES.includes(field.field_type) && (
        <>
          <label className="block font-semibold mb-1">Placeholder</label>
          <Input
            className="mb-4"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
          />
        </>
      )}

      {field.field_type === "price" && (
        <>
          <label className="block font-semibold mb-1">Currency</label>
          <Select
            className="w-full mb-4"
            value={currency}
            options={CURRENCY_OPTIONS}
            onChange={setCurrency}
          />
        </>
      )}

      {(field.field_type === "range" || field.field_type === "quantity") && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block font-semibold mb-1">Min</label>
            <InputNumber className="w-full" value={min} onChange={setMin} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Max</label>
            <InputNumber className="w-full" value={max} onChange={setMax} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Step</label>
            <InputNumber
              className="w-full"
              min={1}
              value={step}
              onChange={setStep}
            />
          </div>
        </div>
      )}

      {field.field_type === "rating" && (
        <>
          <label className="block font-semibold mb-1">Max stars</label>
          <InputNumber
            className="w-full mb-4"
            min={1}
            max={10}
            value={maxRating}
            onChange={setMaxRating}
          />
        </>
      )}

      {field.field_type === "location" && (
        <>
          <label className="block font-semibold mb-1">Division label</label>
          <Input
            className="mb-4"
            value={divisionLabel}
            onChange={(e) => setDivisionLabel(e.target.value)}
          />
          <label className="block font-semibold mb-1">District label</label>
          <Input
            className="mb-4"
            value={districtLabel}
            onChange={(e) => setDistrictLabel(e.target.value)}
          />
        </>
      )}

      {OPTION_FIELD_TYPES.includes(field.field_type) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-semibold">Options</label>
            <Button size="small" onClick={addOption}>
              Add Option
            </Button>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label"
                value={option.label || option.title || ""}
                onChange={(e) =>
                  updateOption(index, { label: e.target.value })
                }
              />
              <Input
                placeholder="Value"
                value={option.value || ""}
                onChange={(e) =>
                  updateOption(index, { value: e.target.value })
                }
              />
              <Button danger onClick={() => removeOption(index)}>
                X
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductFieldConfig;
