import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Drawer,
  Empty,
  Input,
  List,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import instance from "../../../../axios";
import TableFormDrawer from "../../../tables/TableFormDrawer";
import { getTableStats, toHeadlessTable } from "../../../tables/tableUtils";

const { Text } = Typography;

const TableSelectionDrawer = ({
  isVisible,
  onClose,
  onSelectTable,
  initialTable,
}) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/tables");
      const list = Array.isArray(response.data) ? response.data : [];
      setTables(list);
      return list;
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      message.error("Failed to fetch tables");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    setSearchQuery("");
    setSelectedTable(null);
    setIsFormOpen(false);
    setEditingTable(null);
    fetchTables().then((list) => {
      if (initialTable?.id) {
        const match = list.find(
          (table) => String(table.id) === String(initialTable.id)
        );
        if (match) setSelectedTable(match);
      }
    });
  }, [isVisible, initialTable]);

  const filteredTables = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return tables;
    return tables.filter((table) => {
      const haystack = [
        table.title_en,
        table.title_bn,
        table.page_name,
        String(table.id),
        ...(Array.isArray(table.headers) ? table.headers : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [tables, searchQuery]);

  const handleConfirm = () => {
    if (!selectedTable) {
      message.warning("Please select a table");
      return;
    }
    onSelectTable(toHeadlessTable(selectedTable));
    message.success("Table selected successfully");
    onClose();
  };

  return (
    <>
      <Drawer
        title="Select Table"
        placement="right"
        open={isVisible}
        onClose={onClose}
        width="min(720px, 92vw)"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} className="headlesscancelbutton">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedTable}
              className="headlessbutton"
              icon={<CheckCircleOutlined />}
            >
              Use Selected Table
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search tables"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button icon={<ReloadOutlined />} onClick={fetchTables}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-brand hover:bg-brand-dark"
            onClick={() => {
              setEditingTable(null);
              setIsFormOpen(true);
            }}
          >
            Create Table
          </Button>
        </div>

        <List
          loading={loading}
          dataSource={filteredTables}
          locale={{
            emptyText: (
              <Empty
                description="No tables yet. Create one to get started."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          renderItem={(table) => {
            const { columnCount, rowCount } = getTableStats(table);
            const isSelected = selectedTable?.id === table.id;

            return (
              <List.Item
                className={`cursor-pointer rounded-lg border px-3 py-3 mb-2 transition ${
                  isSelected
                    ? "border-brand bg-brand-light/40"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedTable(table)}
                actions={[
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTable(table);
                      setIsFormOpen(true);
                    }}
                  >
                    Edit
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{table.title_en || "Untitled Table"}</Text>
                      {isSelected && <Tag color="green">Selected</Tag>}
                      {table.status === false || table.status === 0 ? (
                        <Tag>Inactive</Tag>
                      ) : null}
                    </Space>
                  }
                  description={
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">
                        ID #{table.id} · {columnCount} columns · {rowCount} rows
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(table.headers || []).slice(0, 5).map((header) => (
                          <Tag key={header}>{header}</Tag>
                        ))}
                        {(table.headers || []).length > 5 && (
                          <Tag>+{table.headers.length - 5}</Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Drawer>

      <TableFormDrawer
        open={isFormOpen}
        editingTable={editingTable}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(null);
        }}
        onSuccess={async (savedTable) => {
          const list = await fetchTables();
          const match =
            list.find((table) => table.id === savedTable.id) || savedTable;
          setSelectedTable(match);
        }}
      />
    </>
  );
};

export default TableSelectionDrawer;
