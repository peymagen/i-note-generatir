import xlsx from "xlsx";
import { pool } from "../../common/services/sql.service";
import { PoHeader } from "./PoHeader.dto";
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

  const validatedRows: PoHeader[] = rows.map((row) => ({
    userId,
    IndentNo: row["IndentNo"]?.toString() || "",
    VendorCode: row["VendorCode"]?.toString() || "",
    OrderDate: formatDate(row["OrderDate"]) || "",
    ValueRs: row["ValueRs"]?.toString() || "",
    InspectingAgencyType: row["InspectingAgencyType"]?.toString() || "",
    InspectorCode: row["InspectorCode"]?.toString() || "",
    InspectionSiteCode: row["InspectionSiteCode"]?.toString() || "",
    Remarks: row["Remarks"]?.toString() || "",
    QuoteKey: Number(row["QuoteKey"]) || 0,
    SelectedQuoteDate: formatDate(row["SelectedQuoteDate"]) || "",
    DateTimeApproved: formatDate(row["DateTimeApproved"]) || "",
    ApprovedBy: row["ApprovedBy"]?.toString() || "",
    TypeClosing: row["TypeClosing"]?.toString() || "",
    DateCloded: formatDate(row["DateCloded"]) || "",
    ClosedBy: row["ClosedBy"]?.toString() || "",
    PackingInstruction: row["PackingInstruction"]?.toString() || "",
    DespatchInstruction: row["DespatchInstruction"]?.toString() || "",
    InspectionInstruction: row["InspectionInstruction"]?.toString() || "",
    StationCode: row["StationCode"]?.toString() || "",
    Remarks1: row["Remarks1"]?.toString() || "",
    Name: row["Name"]?.toString() || "",
    City: row["City"]?.toString() || "",
    State: row["State"]?.toString() || "",
  }));

  const insertValues = validatedRows.map((r) => [
    r.userId,
    r.IndentNo,
    r.VendorCode,
    r.OrderDate,
    r.ValueRs,
    r.InspectingAgencyType,
    r.InspectorCode,
    r.InspectionSiteCode,
    r.Remarks,
    r.QuoteKey,
    r.SelectedQuoteDate,
    r.DateTimeApproved,
    r.ApprovedBy,
    r.TypeClosing,
    r.DateCloded,
    r.ClosedBy,
    r.PackingInstruction,
    r.DespatchInstruction,
    r.InspectionInstruction,
    r.StationCode,
    r.Remarks1,
    r.Name,
    r.City,
    r.State
  ]);

  const query = `
    INSERT INTO PO_HEADER (
      userId,
      IndentNo,
      VendorCode,
      OrderDate,
      ValueRs,
      InspectingAgencyType,
      InspectorCode,
      InspectionSiteCode,
      Remarks,
      QuoteKey,
      SelectedQuoteDate,
      DateTimeApproved,
      ApprovedBy,
      TypeClosing,
      DateCloded,
      ClosedBy,
      PackingInstruction,
      DespatchInstruction,
      InspectionInstruction,
      StationCode,
      Remarks1,
      Name,
      City,
      State
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
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM PO_HEADER ORDER BY id ASC");
    return {
      success: true,
      data: rows
    };
  } catch (error: any) {
    console.error("Error in getAllData:", error);
    throw new Error("Failed to fetch PO Headers");
  }
};

export const getDataById = async (id: number) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM PO_HEADER WHERE id = ?",
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
    throw new Error(`Failed to fetch PO Header with ID ${id}`);
  }
};

export const updateDataById = async (id: number, payload: Partial<PoHeader>) => {
  try {
    // Filter out undefined or null values from payload
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

    // Build dynamic SET clause
    const setClause = Object.keys(filteredPayload)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [
      ...Object.values(filteredPayload),
      id
    ];

    const query = `
      UPDATE PO_HEADER 
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
      "SELECT * FROM PO_HEADER WHERE id = ?",
      [id]
    );

    return {
      success: true,
      message: "Record updated successfully",
      data: updatedRows[0]
    };

  } catch (error: any) {
    console.error("Error in updateDataById:", error);
    throw new Error("Failed to update PO Header: " + error.message);
  }
};


export const deleteDataById = async (id: number) => {
  try {
    const [result]: any = await pool.query(
      "DELETE FROM PO_HEADER WHERE id = ?",
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
    throw new Error("Failed to delete PO Header: " + error.message);
  }
};

export const addData = async(userId:number, payload:any)=>{
  try {
        const query = `
      INSERT INTO PO_HEADER (
        userId,
        IndentNo,
        VendorCode,
        OrderDate,
        ValueRs,
        InspectingAgencyType,
        InspectorCode,
        InspectionSiteCode,
        Remarks,
        QuoteKey,
        SelectedQuoteDate,
        DateTimeApproved,
        ApprovedBy,
        TypeClosing,
        DateCloded,
        ClosedBy,
        PackingInstruction,
        DespatchInstruction,
        InspectionInstruction,
        StationCode,
        Remarks1,
        Name,
        City,
        State
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    const insertValues = [
      userId,
      payload.IndentNo,
      payload.VendorCode,
      payload.OrderDate,
      payload.ValueRs,
      payload.InspectingAgencyType,
      payload.InspectorCode,
      payload.InspectionSiteCode,
      payload.Remarks,
      payload.QuoteKey,
      payload.SelectedQuoteDate,
      payload.DateTimeApproved,
      payload.ApprovedBy,
      payload.TypeClosing,
      payload.DateCloded,
      payload.ClosedBy,
      payload.PackingInstruction,
      payload.DespatchInstruction,
      payload.InspectionInstruction,
      payload.StationCode,
      payload.Remarks1,
      payload.Name,
      payload.City,
      payload.State
    ];
    const [result]: any = await pool.query(
      query,
      insertValues
    );

    return {
      success: true,
      message: "Record added successfully",
      data: result
    }
  }
   catch (error:any) {
    console.error("Error in addData:", error);
    throw new Error("Failed to add PO Header: " + error.message);
  }
}

// export const searchPO = async (IndentNo?: string, OrderDate?: string) => {
//   try {
//     console.log("Searching with params:", { IndentNo, OrderDate });

//     let query = `SELECT * FROM PO_HEADER WHERE 1=1`;
//     const params: any[] = [];

//     // --------------------------
//     // Search By Indent No
//     // --------------------------
//     if (IndentNo && IndentNo.trim() !== "" && IndentNo !== "undefined") {
//       query += ` AND IndentNo = ?`;
//       params.push(IndentNo.trim());
//     }

//     if (OrderDate && OrderDate.trim() !== "" && OrderDate !== "undefined") {
     
//       const cleanDate = OrderDate.includes("T")
//         ? OrderDate.split("T")[0]
//         : OrderDate;

//       console.log("Clean OrderDate used:", cleanDate);

//       query += ` AND OrderDate = ?`;
//       params.push(cleanDate);
//     }

//     console.log("Final Query:", query);
//     console.log("Params:", params);

//     const [rows]: any = await pool.query(query, params);
//     console.log("Query Result:", rows);

//     return rows;

//   } catch (error: any) {
//     console.error("Error in searchPO:", error);
//     throw new Error("Database search failed: " + error.message);
//   }
// };



export const searchPO = async (IndentNo?: string, OrderDate?: string) => {
  try {
    console.log("Searching with params:", { IndentNo, OrderDate });

    // 1. Prepare Header Query
    let headerQuery = `SELECT * FROM PO_HEADER WHERE 1=1`;
    const headerParams: any[] = [];

    if (IndentNo && IndentNo.trim() !== "" && IndentNo !== "undefined") {
      headerQuery += ` AND IndentNo = ?`;
      headerParams.push(IndentNo.trim());
    }

    if (OrderDate && OrderDate.trim() !== "" && OrderDate !== "undefined") {
      const cleanDate = OrderDate.includes("T") ? OrderDate.split("T")[0] : OrderDate;
      headerQuery += ` AND OrderDate = ?`;
      headerParams.push(cleanDate);
    }

    // 2. Execute Header Query
    const [headerRows]: any = await pool.query(headerQuery, headerParams);
    console.log("Header Rows:", headerRows);

    if (!headerRows || headerRows.length === 0) {
      console.log("header  found",headerRows)
      return { 
        success: false,
        header: null,
        details: [], 
        
      };
      console.log("No header found");
    }

    // 4. Fetch Details based on the IndentNo found in the Header
    // console.log("Indent Number:", headerRows[0].IndentNo);
    const foundIndentNo = headerRows[0].IndentNo
    console.log("Found IndentNo:", foundIndentNo);
    const detailQuery = `SELECT * FROM PO_DETAILS WHERE IndentNo = ?`;
    
    const [detailRows]: any = await pool.query(detailQuery, [foundIndentNo]);

    return {
      success: true,
      header: headerRows[0], 
      details: detailRows,    
    };

  } catch (error: any) {
    console.error("Error in searchPO:", error);
    throw new Error("Database search failed: " + error.message);
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
        WHERE TABLE_NAME = 'PO_HEADER'
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
      FROM PO_HEADER
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
      FROM PO_HEADER
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
