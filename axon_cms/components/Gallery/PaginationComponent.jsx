import React from "react";
import { Pagination } from "antd";

const PaginationComponent = ({ current, pageSize, total, onChange }) => {
  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      total={total}
      onChange={onChange}
      showSizeChanger={false}
      className="[&_.ant-pagination-item-active]:border-brand [&_.ant-pagination-item-active_a]:text-brand-dark"
    />
  );
};

export default PaginationComponent;
