import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Input, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import PreviewTable from "../PageBuilder/Modals/TableSelectionModal/PreviewTable";
import { toHeadlessTable, getTableStats } from "./tableUtils";

const { Title, Text } = Typography;

const TablePreviewDrawer = ({ open, onClose, table }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const headless = useMemo(
    () => (table ? toHeadlessTable(table) : null),
    [table]
  );

  const { columnCount, rowCount } = useMemo(
    () => (headless ? getTableStats(headless) : { columnCount: 0, rowCount: 0 }),
    [headless]
  );

  const filteredRows = useMemo(() => {
    const rows = headless?.rows || [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      (row || []).some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [headless, searchTerm]);

  useEffect(() => {
    if (open) setSearchTerm("");
  }, [open, table?.id]);

  if (!table || !headless) return null;

  return (
    <Drawer
      title={headless.title_en || "Untitled Table"}
      open={open}
      onClose={onClose}
      width="min(900px, 92vw)"
    >
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text type="secondary">
            {columnCount} columns · {filteredRows.length}
            {searchTerm.trim() ? ` of ${rowCount}` : ""} rows
          </Text>
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search table data"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(headless.headers || []).map((header) => (
            <Tag key={header}>{header}</Tag>
          ))}
        </div>
      </div>

      <Title level={5}>Preview</Title>
      <PreviewTable
        headers={(headless.headers || []).map((name, index) => ({
          id: `preview-h-${index}`,
          name,
        }))}
        rows={filteredRows.map((data, index) => ({
          id: `preview-r-${index}`,
          data,
        }))}
        visibleColumns={headless.visibleColumns}
        filterColumns={headless.filterColumns}
      />
    </Drawer>
  );
};

export default TablePreviewDrawer;
