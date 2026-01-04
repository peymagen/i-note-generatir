import xlsx from "xlsx";
import { pool } from "../../common/services/sql.service";
import { PoDto } from "./PoDetail.dto";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";

const formatDate = (value: any): string | null => {
  if (!value) return null;

  // Case 1: Excel serial number
  if (typeof value === "number") {
    const d = xlsx.SSF.parse_date_code(value);
    return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }

  // Case 2: String like "03/07/2024 00:00:00"
  if (typeof value === "string") {
    const [datePart] = value.split(" ");
    const [dd, mm, yyyy] = datePart.split("/");

    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
};

export const importExcel = async (buffer: Buffer, userId: number) => {
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: any[] = xlsx.utils.sheet_to_json(sheet);

  // Use PoDto instead of ItemImportDTO
  const validatedRows: PoDto[] = rows.map((row) => {
    const dto: PoDto = {
      userId,
      IndentNo: row["IndentNo"]?.toString() || "",
      VendorCode: row["VendorCode"]?.toString() || "",
      OrderDate: formatDate(row["OrderDate"]) || "",
      OrderLineNo: Number(row["OrderLineNo"]) || 0,
      ItemCode: row["ItemCode"]?.toString() || "",
      ConsigneeCode: row["ConsigneeCode"]?.toString() || "",
      OrderLineDRB: row["OrderLineDRB"]?.toString() || "",
      Specs: row["Specs"]?.toString() || "",
      Qty: Number(row["Qty"]) || 0,
      UniCostCC: Number(row["UniCostCC"]) || 0,
      PilotSampleDRb: row["PilotSampleDRb"]?.toString() || null,
      MIQPQty: Number(row["MIQPQty"]) || 0,
      PackType: row["PackType"]?.toString() || "",
      StationCode: row["StationCode"]?.toString() || "",
      ReReferencedItemCode: row["ReReferencedItemCode"]?.toString() || null,
    };
    return dto;
  });

  // Update the query to match your PoDto fields
  const insertValues = validatedRows.map((r) => [
    r.userId,
    r.IndentNo,
    r.VendorCode,
    r.OrderDate,
    r.OrderLineNo,
    r.ItemCode,
    r.ConsigneeCode,
    r.OrderLineDRB,
    r.Specs,
    r.Qty,
    r.UniCostCC,
    r.PilotSampleDRb,
    r.MIQPQty,
    r.PackType,
    r.StationCode,
    r.ReReferencedItemCode,
  ]);

  const query = `
    INSERT INTO PO_DETAILS (
      userId,
      IndentNo, 
      VendorCode, 
      OrderDate, 
      OrderLineNo, 
      ItemCode,
      ConsigneeCode,
      OrderLineDRB,
      Specs,
      Qty,
      UniCostCC,
      PilotSampleDRb,
      MIQPQty,
      PackType,
      StationCode,
      ReReferencedItemCode
    ) VALUES ?
  `;

  await pool.query(query, [insertValues]);

  return {
    totalInserted: validatedRows.length,
    message: "Excel imported successfully",
  };
};

export const getAllData = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM PO_DETAILS ORDER BY id ASC");
    return {
      success: true,
      data: rows
    };
  } catch (error: any) {
    console.error("Error in getAllData:", error);
    throw new Error("Failed to fetch Item Details");
  }
};

export const getDataById = async (id: number) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM PO_DETAILS WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    return {
      success: true,
      data: rows[0]
    };

  } catch (error: any) {
    console.error("Error in getDataById:", error);
    throw new Error("Failed to fetch Item Detail by ID");
  }
};




export const updateDataById = async (id: number, payload: any) => {
  try {
    
    const filteredPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(filteredPayload).length === 0) {
      return {
        success: false,
        message: "No valid fields to update"
      };
    }

    
    const setClause = Object.keys(filteredPayload)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [
      ...Object.values(filteredPayload),
      id
    ];

    const query = `
      UPDATE PO_DETAILS 
      SET ${setClause}
      WHERE id = ?
    `;

    const [result]: any = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    // Fetch and return the updated record
    const [updatedRows]: any = await pool.query(
      "SELECT * FROM PO_DETAILS WHERE id = ?",
      [id]
    );

    return {
      success: true,
      message: "Record updated successfully",
      data: updatedRows[0]
    };

  } catch (error: any) {
    console.error("Error in updateDataById:", error);
    throw new Error("Failed to update PO detail: " + error.message);
  }
};

export const deleteDataById = async (id: number) => {
  try {
    const [result]: any = await pool.query(
      "DELETE FROM PO_DETAILS WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    return {
      success: true,
      message: "Record deleted successfully"
    };

  } catch (error: any) {
    console.error("Error in deleteDataById:", error);
    throw new Error("Failed to delete PO detail: " + error.message);
  }
};

export  const addData = async (userId: number, payload: any) => {
  try {
    const [result]: any = await pool.query(
      "INSERT INTO PO_DETAILS (userId, IndentNo, VendorCode, OrderDate, OrderLineNo, ItemCode, ConsigneeCode, OrderLineDRB, Specs, Qty, UniCostCC, PilotSampleDRb, MIQPQty, PackType, StationCode, ReReferencedItemCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        payload.IndentNo,
        payload.VendorCode,
        payload.OrderDate,
        payload.OrderLineNo,
        payload.ItemCode,
        payload.ConsigneeCode,
        payload.OrderLineDRB,
        payload.Specs,
        payload.Qty,
        payload.UniCostCC,
        payload.PilotSampleDRb,
        payload.MIQPQty,
        payload.PackType,
        payload.StationCode,
        payload.ReReferencedItemCode
      ]
    );

    return {
      success: true,
      message: "Record added successfully",
      data: result
    };

  } catch (error: any) {
    console.error("Error in addData:", error);
    throw new Error("Failed to add PO detail: " + error.message);
  }
};


export const getByIndent = async (indentNo: string) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM PO_DETAILS WHERE indentno = ?",
      [indentNo]
    );

    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: "No records found for this indent number"
      };
    }

    return {
      success: true,
      data: rows 
    };
  } catch (error: any) {
    console.error("Error in getByIndent service:", error);
    throw error;
  }
};




export const getPaginatedDataWithGlobalSearch = async (
  page?: number,
  limit?: number,
  search?: string
) => {
  try {
    
    const safePage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? limit : 50;
    const offset = (safePage - 1) * safeLimit;

    const normalizedSearch = search?.trim();

    let whereClause = "";
    const values: any[] = [];

    
    if (normalizedSearch) {
      const [columnRows]: any = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'PO_DETAILS'
          AND DATA_TYPE IN ('varchar', 'text', 'char')
      `);

      const searchableColumns: string[] = columnRows.map(
        (c: any) => c.COLUMN_NAME
      );

      if (searchableColumns.length > 0) {
        whereClause =
          "WHERE " +
          searchableColumns.map(col => `${col} LIKE ?`).join(" OR ");

        const searchValue = `%${normalizedSearch}%`;
        searchableColumns.forEach(() => values.push(searchValue));
      }
    }

    
    const dataQuery = `
      SELECT *
      FROM PO_DETAILS
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await pool.query(dataQuery, [
      ...values,
      safeLimit,
      offset,
    ]);

    
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM PO_DETAILS
      ${whereClause}
    `;

    const [[countResult]]: any = await pool.query(
      countQuery,
      values
    );

    const totalRecords = countResult.total;

    return {
      success: true,
      data: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / safeLimit),
      },
      message: "Data fetched successfully",
    };
  } catch (error: any) {
    console.error("Error in getPaginatedDataWithGlobalSearch:", error);
    throw new Error("Failed to fetch data");
  }
};
