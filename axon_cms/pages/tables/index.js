import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Empty, Pagination, Spin, message } from "antd";
import { TableOutlined } from "@ant-design/icons";
import instance from "../../axios";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";
import TablesHeader from "../../components/tables/TablesHeader";
import TablesList from "../../components/tables/TablesList";
import TableFormDrawer from "../../components/tables/TableFormDrawer";
import TablePreviewDrawer from "../../components/tables/TablePreviewDrawer";

const TablesPage = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [previewTable, setPreviewTable] = useState(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await instance.get("/tables");
      if (response.status === 200 && Array.isArray(response.data)) {
        setTables(response.data);
      } else {
        message.error("Failed to fetch tables.");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      message.error("Failed to fetch tables.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useGlobalRefresh(fetchTables);

  const filteredTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
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
  }, [tables, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const paginatedTables = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTables.slice(start, start + itemsPerPage);
  }, [filteredTables, currentPage, itemsPerPage]);

  const handleDelete = async (id) => {
    try {
      await instance.delete(`/tables/${id}`);
      message.success("Table deleted successfully.");
      fetchTables();
    } catch (error) {
      console.error("Error deleting table:", error);
      message.error("Failed to delete table.");
    }
  };

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <div className="space-y-4">
        <TablesHeader
          itemCount={tables.length}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onRefresh={fetchTables}
          onAddTable={() => {
            setEditingTable(null);
            setIsFormOpen(true);
          }}
        />

        {loading ? (
          <div className="mt-6 flex items-center justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredTables.length > 0 ? (
          <>
            <TablesList
              tables={paginatedTables}
              onPreview={setPreviewTable}
              onEdit={(table) => {
                setEditingTable(table);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
            />
            {filteredTables.length > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={filteredTables.length}
                  onChange={setCurrentPage}
                  showSizeChanger
                  onShowSizeChange={(_, size) => setItemsPerPage(size)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16">
            <Empty
              image={
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-2xl text-brand-dark">
                  <TableOutlined />
                </div>
              }
              description={
                <div className="space-y-1">
                  <p className="text-base font-medium text-gray-800">
                    No tables found
                  </p>
                  <p className="text-sm text-gray-500">
                    Create a reusable table to use in the page builder.
                  </p>
                </div>
              }
            />
          </div>
        )}
      </div>

      <TableFormDrawer
        open={isFormOpen}
        editingTable={editingTable}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(null);
        }}
        onSuccess={() => {
          fetchTables();
        }}
      />

      <TablePreviewDrawer
        open={Boolean(previewTable)}
        table={previewTable}
        onClose={() => setPreviewTable(null)}
      />
    </div>
  );
};

export default TablesPage;
