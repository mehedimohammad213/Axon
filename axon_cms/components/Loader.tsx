import { Spin } from "antd";
import React from "react";

const Loader = () => {
  return (
    <div
      className="headlesscontainer"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {" "}
      <Spin size="large" />{" "}
    </div>
  );
};

export default Loader;
