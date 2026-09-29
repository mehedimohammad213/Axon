import React from "react";

export const MediaTabLabel = ({ label, count }) => (
  <span className="media-tab-label">
    <span className="media-tab-text">{label}</span>
    {typeof count === "number" && (
      <span className="media-tab-count">{count}</span>
    )}
  </span>
);

const MediaTabBar = ({ items = [], activeKey, onChange }) => {
  if (!items.length) return null;

  return (
    <div className="media-tab-bar" role="tablist">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`media-tab-bar-item${isActive ? " is-active" : ""}`}
            onClick={() => onChange?.(item.key)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default MediaTabBar;
