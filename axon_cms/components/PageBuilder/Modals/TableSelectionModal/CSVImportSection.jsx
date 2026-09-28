import React, { useState } from "react";
import { Button, Typography, message, Upload } from "antd";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import {
  DownOutlined,
  FileExcelOutlined,
  InboxOutlined,
  UpOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Dragger } = Upload;

const CSVImportSection = ({ setHeaders, setRows }) => {
  const [open, setOpen] = useState(false);
  const [importedFile, setImportedFile] = useState(null);

  const handleCSVUpload = (file) => {
    const isCsv =
      file.type === "text/csv" ||
      file.name?.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      message.error("Please upload a .csv file.");
      return Upload.LIST_IGNORE;
    }

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const { data } = result;
        if (data && data.length > 0) {
          const csvHeaderStrings = data[0].map((h) =>
            String(h ?? "").trim()
          );
          const csvHeaders = csvHeaderStrings.map((colName) => ({
            id: uuidv4(),
            name: colName,
          }));
          const csvRows = data.slice(1);

          setHeaders(csvHeaders);
          setRows(csvRows.map((r) => ({ id: uuidv4(), data: r })));
          setImportedFile({
            name: file.name,
            columns: csvHeaders.length,
            rows: csvRows.length,
          });
          setOpen(true);

          message.success("CSV imported successfully.");
        } else {
          message.error("CSV file is empty or invalid.");
        }
      },
      error: () => {
        message.error("Failed to parse CSV file.");
      },
    });

    return false;
  };

  const draggerProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    accept: ".csv,text/csv",
    showUploadList: false,
    beforeUpload: handleCSVUpload,
  };

  return (
    <div className="mb-8">
      <div className="flex justify-center">
        <Button
          onClick={() => setOpen((prev) => !prev)}
          className="headlessbutton headlessbutton-pill !mr-0"
        >
          <FileExcelOutlined />
          Import CSV
          {open ? (
            <UpOutlined className="text-[10px]" />
          ) : (
            <DownOutlined className="text-[10px]" />
          )}
        </Button>
      </div>

      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <Dragger {...draggerProps} className="csv-import-dragger">
            <div className="flex flex-col items-center px-3 py-1">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-xl text-brand-dark">
                <InboxOutlined />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-800">
                Click or drag a CSV file here
              </p>
              <p className="m-0 text-xs text-gray-500">
                First row becomes column headers. One file at a time.
              </p>
            </div>
          </Dragger>

          {importedFile && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2">
              <FileExcelOutlined className="text-green-700" />
              <Text className="text-xs text-green-800">
                Imported{" "}
                <span className="font-semibold">{importedFile.name}</span>
                {" · "}
                {importedFile.columns} columns · {importedFile.rows} rows
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVImportSection;
