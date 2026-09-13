// components/PageBuilder/PageInfoDisplay.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuOutlined, LinkOutlined, FileTextOutlined } from "@ant-design/icons";

const InfoRow = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-800">
      {children}
    </dd>
  </div>
);

const PageInfoDisplay = ({ page, linkedMenuItems = [] }) => {
  const type = page?.type || "Unknown";
  const pageTypeLabel =
    page.additional?.length > 0
      ? page.additional.map((item) => item.pageType).filter(Boolean).join(", ")
      : type;
  const metaImage = page.additional?.[0]?.metaImage;
  const metaImageAlt = page.additional?.[0]?.metaImageAlt || "Meta image";
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL || "";

  return (
    <div className="space-y-5">
      <div
        className={`grid gap-5 ${metaImage ? "lg:grid-cols-[1fr_140px]" : ""}`}
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <InfoRow label={`${type} title`}>
            {page.page_name_en || "—"}
          </InfoRow>

          <InfoRow label={`${type} title (alt)`}>
            {page.page_name_bn || "—"}
          </InfoRow>

          {(type === "Page" || type === "Footer") && (
            <InfoRow label={type === "Footer" ? "Footer builder link" : "Page builder link"}>
              <Link href={`/page-builder/${page.id}`}>
                <a className="inline-flex items-center gap-1.5 text-brand-dark hover:underline">
                  <LinkOutlined className="text-xs" />
                  <span>/{page.slug || page.id}</span>
                </a>
              </Link>
            </InfoRow>
          )}

          <InfoRow label="Type">
            <span className="inline-flex items-center gap-1.5">
              <FileTextOutlined className="text-xs text-gray-400" />
              {pageTypeLabel || "Page"}
            </span>
          </InfoRow>
        </dl>

        {metaImage && (
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Meta image
            </span>
            <div className="relative mt-2 h-28 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 sm:w-32 lg:w-full">
              <Image
                src={`${mediaBase}/${metaImage}`}
                alt={metaImageAlt}
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        )}
      </div>

      {type !== "Footer" && (
        <div className="border-t border-gray-100 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <MenuOutlined className="text-sm text-teal-600" />
            <h4 className="text-sm font-semibold text-gray-800">Menu links</h4>
          </div>

          {linkedMenuItems.length > 0 ? (
            <ul className="space-y-2">
              {linkedMenuItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-0.5 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {item.title}
                  </span>
                  <span className="truncate font-mono text-xs text-gray-500">
                    {item.link || "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-3 py-3 text-sm text-gray-500">
              Not linked to any menu item
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PageInfoDisplay;
