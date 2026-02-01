import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { EXCEL_COLUMNS } from "../pages/DataCollective/excelColumn";  
export const exportOnlyHeaders = (tableKey: keyof typeof EXCEL_COLUMNS) => {
  const headers = EXCEL_COLUMNS[tableKey];

  if (!headers) {
    console.error("Invalid table key");
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet([headers]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${tableKey}_Template.xlsx`);
};


