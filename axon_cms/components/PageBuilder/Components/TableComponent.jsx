// components/PageBuilder/Components/TableComponent.jsx

import React, { useState, useEffect } from "react";
import { Button, Typography, message, Tooltip } from "antd";
import { PlusOutlined, DragOutlined } from "@ant-design/icons";
import TableSelectionDrawer from "../Modals/TableSelectionModal/TableSelectionDrawer";
import ComponentEditButton from "./components/ComponentEditButton";
import ComponentDuplicateButton from "./components/ComponentDuplicateButton";
import ComponentDeleteButton from "./components/ComponentDeleteButton";
import { toHeadlessTable, isImageCellValue } from "../../tables/tableUtils";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const { Paragraph } = Typography;

const HoverImage = ({ value, size = 48, previewSize = 220 }) => {
  const src = resolveMediaUrl(value);

  const preview = (
    <div className="p-1">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <img
          src={src}
          alt=""
          className="max-h-[220px] max-w-[220px] object-contain"
          style={{ width: previewSize, height: previewSize }}
        />
      </div>
    </div>
  );

  return (
    <Tooltip
      title={preview}
      placement="rightTop"
      color="#ffffff"
      overlayInnerStyle={{ padding: 4 }}
      mouseEnterDelay={0.15}
    >
      <div className="inline-flex cursor-zoom-in items-center justify-center transition-transform hover:scale-105">
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          style={{
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            display: "block",
          }}
        />
      </div>
    </Tooltip>
  );
};

const renderCell = (value) => {
  if (isImageCellValue(value)) {
    return <HoverImage value={value} />;
  }
  return value;
};

const TableComponent = ({
  component,
  updateComponent,
  deleteComponent,
  preview = false,
  onDuplicateElement,
}) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [tableData, setTableData] = useState(
    toHeadlessTable(component._headless || {})
  );
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    setTableData(toHeadlessTable(component._headless || {}));
  }, [component._headless]);

  useEffect(() => {
    if (tableData) {
      const cols = tableData.headers?.map((header, index) => ({
        title: header,
        dataIndex: `col${index}`,
        key: `col${index}`,
      }));
      setColumns(cols);
      const rows = tableData.rows?.map((row, rowIndex) => ({
        key: rowIndex,
        ...row.reduce((acc, cell, colIndex) => {
          acc[`col${colIndex}`] = cell;
          return acc;
        }, {}),
      }));
      setDataSource(rows);
    }
  }, [tableData]);

  const handleSelectTable = (selectedTable) => {
    const headless = toHeadlessTable(selectedTable);
    updateComponent({
      ...component,
      id: headless.id,
      _headless: headless,
    });
    setTableData(headless);
    setIsDrawerVisible(false);
    message.success("Table updated successfully.");
  };

  const handleDelete = () => {
    deleteComponent();
  };

  if (preview) {
    return (
      <div className="preview-table-component p-4 bg-gray-100 rounded-md">
        {tableData?.headers?.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              className="min-w-full border-collapse"
              style={{
                border:
                  tableData?.styles?.borderStyle === "none"
                    ? "none"
                    : tableData?.styles?.borderStyle === "thin"
                      ? "1px solid #ddd"
                      : "2px solid #000",
                backgroundColor: tableData?.styles?.cellColor || "#fff",
                textAlign: tableData?.styles?.textAlign || "left",
              }}
            >
              <thead>
                <tr>
                  {columns?.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 border"
                      style={{
                        border:
                          tableData?.styles?.borderStyle === "none"
                            ? "none"
                            : "1px solid #ddd",
                      }}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataSource?.map((row) => (
                  <tr key={row.key}>
                    {columns?.map((col, index) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 border"
                        style={{
                          border:
                            tableData?.styles?.borderStyle === "none"
                              ? "none"
                              : "1px solid #ddd",
                        }}
                      >
                        {renderCell(row[`col${index}`])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Paragraph className="text-gray-500">
            No table data available.
          </Paragraph>
        )}
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DragOutlined className="text-2xl border rounded-md p-1" />
          <h3 className="text-xl font-semibold">Table Component</h3>
        </div>
        <div>
          {tableData?.headers?.length > 0 && (
            <>
              <ComponentEditButton
                onClick={() => setIsDrawerVisible(true)}
                title="Edit table"
              />
              <ComponentDuplicateButton
                onClick={onDuplicateElement}
                title="Duplicate component"
              />
              <ComponentDeleteButton
                onConfirm={handleDelete}
                title="Delete component"
                confirmTitle="Are you sure you want to delete this component?"
              />
            </>
          )}
        </div>
      </div>

      {tableData?.headers?.length > 0 ? (
        <div className="overflow-x-auto">
          <table
            className="min-w-full border-collapse"
            style={{
              border:
                tableData?.styles?.borderStyle === "none"
                  ? "none"
                  : tableData?.styles?.borderStyle === "thin"
                    ? "1px solid #ddd"
                    : "2px solid #000",
              backgroundColor: tableData?.styles?.cellColor || "#fff",
              textAlign: tableData?.styles?.textAlign || "left",
            }}
          >
            <thead>
              <tr>
                {columns?.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2 border"
                    style={{
                      border:
                        tableData?.styles?.borderStyle === "none"
                          ? "none"
                          : "1px solid #ddd",
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataSource?.map((row) => (
                <tr key={row.key}>
                  {columns?.map((col, index) => (
                    <td
                      key={col.key}
                      className="px-4 py-2 border"
                      style={{
                        border:
                          tableData?.styles?.borderStyle === "none"
                            ? "none"
                            : "1px solid #ddd",
                      }}
                    >
                      {renderCell(row[`col${index}`])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setIsDrawerVisible(true)}
          className="headlessbutton"
        >
          Add Table
        </Button>
      )}

      <TableSelectionDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        onSelectTable={handleSelectTable}
        initialTable={tableData}
      />
    </div>
  );
};

export default TableComponent;
