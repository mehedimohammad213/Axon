import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  RestOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import instance from "../../axios";
import { setPageTitle } from "../../global/constants/pageTitle";
import { useGlobalRefresh } from "../../src/context/MenuRefreshContext";

const TYPE_COLORS = {
  pages: "blue",
  media: "purple",
  menuitems: "cyan",
  navbars: "geekblue",
  cards: "magenta",
  sliders: "orange",
  footers: "gold",
  tables: "lime",
  products: "green",
  "product-types": "volcano",
  form_builder: "processing",
  "form-submission": "default",
  "generated-models": "red",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

const TrashPage = () => {
  const [items, setItems] = useState([]);
  const [byType, setByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    setPageTitle("Trash");
  }, []);

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instance.get("/trash");
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const counts = response.meta?.byType || response.data?.meta?.byType || {};
      setItems(list);
      setByType(counts);
    } catch (error) {
      console.error("Error fetching trash:", error);
      message.error(error?.response?.data?.message || "Failed to load trash.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  useGlobalRefresh(fetchTrash);

  const typeOptions = useMemo(() => {
    const keys = Object.keys(byType);
    return [
      { value: "all", label: `All (${items.length})` },
      ...keys.map((type) => {
        const label = items.find((item) => item.type === type)?.type_label || type;
        return { value: type, label: `${label} (${byType[type]})` };
      }),
    ];
  }, [byType, items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesSearch =
        !term ||
        item.title?.toLowerCase().includes(term) ||
        item.type_label?.toLowerCase().includes(term) ||
        String(item.id).includes(term);
      return matchesType && matchesSearch;
    });
  }, [items, searchTerm, selectedType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const itemKey = (item) => `${item.type}-${item.id}`;

  const handleRestore = async (item) => {
    const key = itemKey(item);
    try {
      setBusyKey(key);
      await instance.post(`/trash/${item.type}/${item.id}/restore`);
      message.success(`${item.type_label} restored successfully.`);
      await fetchTrash();
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to restore item.");
    } finally {
      setBusyKey("");
    }
  };

  const handlePermanentDelete = (item) => {
    Modal.confirm({
      title: "Permanently delete this item?",
      content: (
        <div className="space-y-1">
          <p>
            <span className="font-semibold">{item.title}</span> will be removed forever.
          </p>
          <p className="text-gray-500">This cannot be undone.</p>
        </div>
      ),
      okText: "Delete permanently",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        const key = itemKey(item);
        try {
          setBusyKey(key);
          await instance.delete(`/trash/${item.type}/${item.id}`);
          message.success(`${item.type_label} permanently deleted.`);
          await fetchTrash();
        } catch (error) {
          message.error(
            error?.response?.data?.message || "Failed to permanently delete item."
          );
          throw error;
        } finally {
          setBusyKey("");
        }
      },
    });
  };

  return (
    <div className="headlesscontainer rounded-xl bg-gray-50/80 px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-12">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--theme-transparent)]">
              <RestOutlined className="text-2xl text-[var(--theme)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Trash</h1>
              <p className="text-sm text-gray-500">
                Restore items or permanently delete them. Soft-deleted content lives here.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tag color="red" className="m-0 px-3 py-1 text-sm">
              {items.length} item{items.length === 1 ? "" : "s"}
            </Tag>
            <Tooltip title="Refresh trash">
              <Button icon={<ReloadOutlined />} onClick={fetchTrash} />
            </Tooltip>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_140px]">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search by title, type, or ID"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Select
            value={selectedType}
            onChange={setSelectedType}
            options={typeOptions}
            className="w-full"
          />
          <Select
            value={itemsPerPage}
            onChange={setItemsPerPage}
            options={[
              { value: 8, label: "8 / page" },
              { value: 12, label: "12 / page" },
              { value: 24, label: "24 / page" },
            ]}
            className="w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Spin tip="Loading trash..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16">
          <Empty
            description={
              items.length === 0
                ? "Trash is empty. Deleted items will appear here."
                : "No matching items in trash."
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((item) => {
              const key = itemKey(item);
              const busy = busyKey === key;
              return (
                <div
                  key={key}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Tag color={TYPE_COLORS[item.type] || "default"} className="m-0">
                        {item.type_label}
                      </Tag>
                      <span className="text-xs text-gray-400">#{item.id}</span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-800">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Deleted {formatDate(item.deleted_at)}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="primary"
                      icon={<UndoOutlined />}
                      loading={busy}
                      onClick={() => handleRestore(item)}
                      className="flex-1"
                    >
                      Restore
                    </Button>
                    <Tooltip title="Delete permanently">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        loading={busy}
                        onClick={() => handlePermanentDelete(item)}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length > itemsPerPage && (
            <div className="mt-6 flex justify-center">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={filteredItems.length}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrashPage;
