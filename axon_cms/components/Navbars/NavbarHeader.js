// components/Navbars/NavbarHeader.js

import React, { useState } from "react";
import {
  Input,
  Button,
  Select,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
} from "antd";
import {
  CopyOutlined,
  FilterOutlined,
  MenuOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { copyApiEndpoint } from "../../utils/copyApiEndpoint";

const { Option } = Select;

const NavbarHeader = ({
  onAddNavbar,
  searchTerm,
  setSearchTerm,
  sortType,
  setSortType,
  onShowChange,
  applyFilters,
  resetFilters,
  onRefresh,
  itemCount,
}) => {
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [form] = Form.useForm();

  const openFilterModal = () => setIsFilterModalVisible(true);
  const closeFilterModal = () => setIsFilterModalVisible(false);

  const onFinish = (values) => {
    applyFilters?.(values);
    closeFilterModal();
  };

  const handleResetFilters = () => {
    form.resetFields();
    resetFilters?.();
    closeFilterModal();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      message.success("Data refreshed successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-gray-200 bg-brand-light p-3">
              <Image
                src="/icons/headless/navbar.svg"
                width={28}
                height={28}
                alt="Navbars"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                Navbars
              </h1>
              {typeof itemCount === "number" && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/80 px-2.5 py-1">
                  <MenuOutlined className="text-xs text-brand-dark" />
                  <Badge
                    count={itemCount}
                    showZero
                    overflowCount={9999}
                    className="[&_.ant-badge-count]:bg-brand [&_.ant-badge-count]:text-white [&_.ant-badge-count]:text-xs [&_.ant-badge-count]:min-w-[20px] [&_.ant-badge-count]:h-5 [&_.ant-badge-count]:leading-5"
                  />
                  <span className="ml-0.5 text-xs font-medium text-blue-700">
                    Navbars
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={onAddNavbar}
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Create Navbar
            </Button>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
                onClick={handleRefresh}
                size="large"
              />
            </Tooltip>
            <Tooltip title="Copy API endpoint">
              <Button
                icon={<CopyOutlined />}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
                onClick={() => copyApiEndpoint("/navbars")}
                size="large"
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort</span>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                <Button
                  type={sortType === "desc" ? "primary" : "text"}
                  size="small"
                  onClick={() => setSortType("desc")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    sortType === "desc"
                      ? "bg-brand text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  Newest
                </Button>
                <Button
                  type={sortType === "asc" ? "primary" : "text"}
                  size="small"
                  onClick={() => setSortType("asc")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    sortType === "asc"
                      ? "bg-brand text-white"
                      : "text-gray-600 hover:bg-white hover:text-gray-800"
                  }`}
                >
                  Oldest
                </Button>
              </div>
            </div>

            <Button
              icon={<FilterOutlined />}
              className="h-9 rounded-lg border-gray-200 font-medium text-gray-700 hover:border-brand hover:text-brand-dark"
              onClick={openFilterModal}
            >
              Filter
            </Button>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Show</span>
              <Select
                defaultValue="10"
                className="w-24 [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-gray-200"
                onChange={onShowChange}
              >
                <Select.Option value="10">10</Select.Option>
                <Select.Option value="20">20</Select.Option>
                <Select.Option value="50">50</Select.Option>
                <Select.Option value="100">100</Select.Option>
              </Select>
            </div>

            <Input
              placeholder="Search navbars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border-gray-200 sm:w-72 [&_.ant-input]:placeholder:text-gray-400"
              allowClear
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </div>
        </div>
      </div>

      <Modal
        title="Filter navbars"
        open={isFilterModalVisible}
        onCancel={closeFilterModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ logo: undefined, menu_items: undefined }}
        >
          <Form.Item label="Logo" name="logo">
            <Select placeholder="Select logo" allowClear>
              <Option value="with">With logo</Option>
              <Option value="without">Without logo</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Menu items" name="menu_items">
            <Select placeholder="Select menu items" allowClear>
              <Option value="with">With menu items</Option>
              <Option value="without">Without menu items</Option>
            </Select>
          </Form.Item>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={handleResetFilters}
              className="headlesscancelbutton headlessbutton-pill !mr-0"
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="headlessbutton headlessbutton-pill !mr-0"
            >
              Apply
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NavbarHeader;
