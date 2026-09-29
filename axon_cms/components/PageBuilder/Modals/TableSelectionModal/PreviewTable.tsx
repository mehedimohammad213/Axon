// TableSelectionModal/PreviewTable.jsx

import React, { useMemo, useState } from "react";
import { Table, Input, Button, Space, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { resolveMediaUrl } from "../../../../utils/mediaUrl";
import { isImageCellValue } from "../../../tables/tableUtils";

const HoverImage = ({ value, alt = "", size = 48, previewSize = 220 }) => {
  const src = resolveMediaUrl(value);

  const preview = (
    <div className="p-1">
      <div className="flex items-center justify-center rounded-lg bg-white p-3">
        <img
          src={src}
          alt={alt}
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
          alt={alt}
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

const PreviewTable = ({ headers, visibleColumns, rows, filterColumns }) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColIndex, setSearchedColIndex] = useState(null);

  const handleSearch = (selectedKeys, confirm, colIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColIndex(colIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setSearchedColIndex(null);
  };

  const columns = useMemo(() => {
    return headers
      .map((colObj, colIndex) => {
        if (!visibleColumns[colIndex]) return null;

        const colDef = {
          title: colObj.name,
          dataIndex: String(colIndex),
          key: colObj.id,
          render: (value) => {
            if (isImageCellValue(value)) {
              return <HoverImage value={value} alt={colObj.name} />;
            }
            return value;
          },
        };

        if (filterColumns.includes(colObj.name)) {
          colDef.filterDropdown = ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search ${colObj.name}`}
                value={selectedKeys[0]}
                onChange={(e) =>
                  setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() =>
                  handleSearch(selectedKeys, confirm, colIndex)
                }
                style={{ marginBottom: 8, display: "block" }}
              />
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
                  onClick={() => handleSearch(selectedKeys, confirm, colIndex)}
                >
                  Search
                </Button>
                <Button
                  onClick={() => {
                    handleReset(clearFilters);
                    confirm({ closeDropdown: true });
                  }}
                  size="small"
                  style={{ width: 90 }}
                >
                  Reset
                </Button>
              </Space>
            </div>
          );

          colDef.onFilter = (value, record) => {
            const cellVal = (record[String(colIndex)] || "").toLowerCase();
            return cellVal.includes(value.toLowerCase());
          };

          if (searchedColIndex === colIndex && searchText) {
            colDef.filteredValue = [searchText];
          } else {
            colDef.filteredValue = null;
          }
        }

        return colDef;
      })
      .filter(Boolean);
  }, [headers, visibleColumns, filterColumns, searchedColIndex, searchText]);

  const dataSource = useMemo(() => {
    return rows.map((row) => {
      const rowObj = { key: row.id };
      row.data.forEach((cellVal, colIndex) => {
        rowObj[String(colIndex)] = cellVal;
      });
      return rowObj;
    });
  }, [rows]);

  return <Table columns={columns} dataSource={dataSource} />;
};

export default PreviewTable;
