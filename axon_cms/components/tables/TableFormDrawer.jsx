import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Switch,
  Typography,
  message,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import instance from "../../axios";
import CSVImportSection from "../PageBuilder/Modals/TableSelectionModal/CSVImportSection";
import HeadersSection from "../PageBuilder/Modals/TableSelectionModal/HeadersSection";
import RowsSection from "../PageBuilder/Modals/TableSelectionModal/RowsSection";
import PreviewTable from "../PageBuilder/Modals/TableSelectionModal/PreviewTable";
import FilterableColumns from "../PageBuilder/Modals/TableSelectionModal/FilterableColumns";
import { toApiPayload, toHeadlessTable } from "./tableUtils";

const { Title } = Typography;

const defaultHeaders = [{ id: "default-1", name: "Column 1 Heading" }];

const TableFormDrawer = ({
  open,
  onClose,
  onSuccess,
  editingTable = null,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [headers, setHeaders] = useState(defaultHeaders);
  const [rows, setRows] = useState([{ id: uuidv4(), data: [""] }]);
  const [visibleColumns, setVisibleColumns] = useState([true]);
  const [filterColumns, setFilterColumns] = useState([]);

  useEffect(() => {
    if (!open) return;

    const source = editingTable ? toHeadlessTable(editingTable) : null;

    form.setFieldsValue({
      title_en: source?.title_en || "",
      title_bn: source?.title_bn || "",
      page_name: source?.page_name || undefined,
      status: source ? source.status !== false : true,
    });

    if (source?.headers?.length) {
      setHeaders(source.headers.map((name) => ({ id: uuidv4(), name })));
      setRows(
        (source.rows || []).map((row) => ({ id: uuidv4(), data: [...row] }))
      );
      setVisibleColumns(
        source.visibleColumns?.length
          ? source.visibleColumns
          : source.headers.map(() => true)
      );
      setFilterColumns(source.filterColumns || []);
    } else {
      setHeaders(defaultHeaders);
      setRows([{ id: uuidv4(), data: [""] }]);
      setVisibleColumns([true]);
      setFilterColumns([]);
    }
  }, [open, editingTable, form]);

  useEffect(() => {
    setRows((prevRows) => {
      let changed = false;
      const nextRows = prevRows.map((row) => {
        const data = [...(row.data || [])];
        if (data.length < headers.length) {
          changed = true;
          return {
            ...row,
            data: [...data, ...Array(headers.length - data.length).fill("")],
          };
        }
        if (data.length > headers.length) {
          changed = true;
          return { ...row, data: data.slice(0, headers.length) };
        }
        return row;
      });
      return changed ? nextRows : prevRows;
    });

    setVisibleColumns((prev) => {
      if (prev.length < headers.length) {
        return [
          ...prev,
          ...Array(headers.length - prev.length).fill(true),
        ];
      }
      if (prev.length > headers.length) {
        return prev.slice(0, headers.length);
      }
      return prev;
    });
  }, [headers.length]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      for (let i = 0; i < rows.length; i += 1) {
        if (rows[i]?.data?.length !== headers.length) {
          message.error(`Row ${i + 1} does not match the number of columns.`);
          return;
        }
      }

      const payload = toApiPayload({
        ...values,
        headers: headers.map((header) => header.name),
        rows: rows.map((row) => row.data),
        visibleColumns,
        filterColumns,
        additional: editingTable?.additional || {},
      });

      setSubmitting(true);

      const response = editingTable?.id
        ? await instance.put(`/tables/${editingTable.id}`, payload)
        : await instance.post("/tables", payload);

      message.success(
        editingTable?.id ? "Table updated successfully." : "Table created successfully."
      );
      onSuccess?.(response.data);
      onClose?.();
    } catch (error) {
      if (error?.errorFields) {
        message.error("Please fix the errors in the form.");
        return;
      }
      message.error(
        editingTable?.id ? "Failed to update table." : "Failed to create table."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={editingTable?.id ? "Edit Table" : "Create Table"}
      placement="right"
      open={open}
      onClose={onClose}
      width="min(1100px, 92vw)"
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} className="headlesscancelbutton">
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit}
            className="headlessbutton"
          >
            {editingTable?.id ? "Update Table" : "Create Table"}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label="Title"
            name="title_en"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input
              placeholder="Table title"
              onChange={(e) => {
                const value = e.target.value;
                form.setFieldsValue({
                  title_en: value,
                  title_bn: form.getFieldValue("title_bn") || value,
                });
              }}
            />
          </Form.Item>
          <Form.Item label="Alternate Title" name="title_bn">
            <Input placeholder="Alternate title" />
          </Form.Item>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item label="Page Name" name="page_name">
            <Input placeholder="Optional page label" />
          </Form.Item>
          <Form.Item label="Active" name="status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <CSVImportSection setHeaders={setHeaders} setRows={setRows} />

        <HeadersSection
          headers={headers}
          setHeaders={setHeaders}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          rows={rows}
          setRows={setRows}
          filterColumns={filterColumns}
          setFilterColumns={setFilterColumns}
        />

        <RowsSection headers={headers} rows={rows} setRows={setRows} />

        <div className="grid grid-cols-10 items-center gap-4">
          <Title level={4} className="col-span-7 !mb-0">
            Preview
          </Title>
          <div className="col-span-3">
            <Title level={5}>Filterable Columns</Title>
            <FilterableColumns
              headers={headers}
              filterColumns={filterColumns}
              setFilterColumns={setFilterColumns}
            />
          </div>
        </div>

        <PreviewTable
          headers={headers}
          rows={rows}
          visibleColumns={visibleColumns}
          filterColumns={filterColumns}
        />
      </Form>
    </Drawer>
  );
};

export default TableFormDrawer;
