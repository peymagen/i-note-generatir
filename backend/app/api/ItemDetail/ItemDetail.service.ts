import xlsx from "xlsx";
import { pool } from "../../common/services/sql.service";
import { ItemImportDTO } from "./ItemDetail.dto";
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

  const validatedRows: ItemImportDTO[] = rows.map((row) => {
    const dto: ItemImportDTO = {
      userId,
      IndentNo: row["IndentNo"]?.toString() || "",
      VendorCode: row["VendorCode"]?.toString() || "",
      OrderDate: formatDate(row["OrderDate"]) || "",
      OrderLineNo: Number(row["OrderLineNo"]) || 0,
      ItemCode: row["ItemCode"]?.toString() || "",
      SectionHead: row["SectionHead"]?.toString() || "",
      ItemDesc: row["ItemDesc"]?.toString() || "",
      CountryCode: row["CountryCode"]?.toString() || "",
      ItemDeno: row["ItemDeno"]?.toString() || "",
      MonthsShelfLife: Number(row["MonthsShelfLife"]) || 0,
      CRPCategory: row["CRPCategory"]?.toString() || "",
      VEDCCategory: row["VEDCCategory"]?.toString() || "",
      ABCCategory: row["ABCCategory"]?.toString() || "",
      DateTimeApproved: formatDate(row["DateTimeApproved"]),
      ApprovedBy: row["ApprovedBy"]?.toString() || "",
      ReviewSubSectionCode: row["ReviewSubSectionCode"]?.toString() || "",
      INCATYN: row["INCATYN"]?.toString() || "",
    };
    return dto;
  });

  const insertValues = validatedRows.map((r) => [
    r.userId,
    r.IndentNo,
    r.VendorCode,
    r.OrderDate,
    r.OrderLineNo,
    r.ItemCode,
    r.SectionHead,
    r.ItemDesc,
    r.CountryCode,
    r.ItemDeno,
    r.MonthsShelfLife,
    r.CRPCategory,
    r.VEDCCategory,
    r.ABCCategory,
    r.DateTimeApproved || null, // Handle null case for database
    r.ApprovedBy,
    r.ReviewSubSectionCode,
    r.INCATYN,
  ]);

  const query = `
    INSERT INTO ITEMS_DETAILS (
      userId,
      IndentNo, VendorCode, OrderDate, OrderLineNo, ItemCode,
      SectionHead, ItemDesc, CountryCode, ItemDeno, MonthsShelfLife,
      CRPCategory, VEDCCategory, ABCCategory, DateTimeApproved, ApprovedBy,
      ReviewSubSectionCode, INCATYN
    ) VALUES ?
  `;

  await pool.execute<ResultSetHeader>(query, [insertValues]);

  return {
    totalInserted: validatedRows.length,
    message: "Excel imported successfully",
  };
};

// export const getAllData = async () => {
//   try {
//     console.log("hello")
//     const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM ITEMS_DETAILS ORDER BY id ASC");
//     return {
//       success: true,
//       data: rows
//     };
//   } catch (error: any) {
//     console.error("Error in getAllData:", error);
//     throw new Error("Failed to fetch Item Details");
//   }
// };

export const getDataById = async (id: number) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM ITEMS_DETAILS WHERE id = ?",
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


// export const updateDataById = async (id: number, payload: any) => {
//   try {
//     const query = `
//       UPDATE ITEMS_DETAILS SET
//         IndentNo = ?,
//         VendorCode = ?,
//         OrderDate = ?,
//         OrderLineNo = ?,
//         ItemCode = ?,
//         SectionHead = ?,
//         ItemDesc = ?,
//         CountryCode = ?,
//         ItemDeno = ?,
//         MonthsShelfLife = ?,
//         CRPCategory = ?,
//         VEDCCategory = ?,
//         ABCCategory = ?,
//         DateTimeApproved = ?,
//         ApprovedBy = ?,
//         ReviewSubSectionCode = ?,
//         INCATYN = ?
//       WHERE id = ?
//     `;

//     const values = [
//       payload.IndentNo,
//       payload.VendorCode,
//       payload.OrderDate,
//       payload.OrderLineNo,
//       payload.ItemCode,
//       payload.SectionHead,
//       payload.ItemDesc,
//       payload.CountryCode,
//       payload.ItemDeno,
//       payload.MonthsShelfLife,
//       payload.CRPCategory,
//       payload.VEDCCategory,
//       payload.ABCCategory,
//       payload.DateTimeApproved,
//       payload.ApprovedBy,
//       payload.ReviewSubSectionCode,
//       payload.INCATYN,
//       id
//     ];

//     const [result]: any = await pool.query(query, values);

//     if (result.affectedRows === 0) {
//       return {
//         success: false,
//         message: "Record not found",
//       };
//     }

//     return {
//       success: true,
//       message: "Record updated successfully",
//     };

//   } catch (error: any) {
//     console.error("Error in updateDataById:", error);
//     throw new Error("Failed to update PO detail");
//   }
// };


export const updateDataById = async (id: number, payload: any) => {
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
      UPDATE ITEMS_DETAILS 
      SET ${setClause}
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    // Fetch and return the updated record
    const [updatedRows]: any = await pool.execute<ResultSetHeader>(
      "SELECT * FROM ITEMS_DETAILS WHERE id = ?",
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
    const query = "DELETE FROM ITEMS_DETAILS WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    if ((result as ResultSetHeader).affectedRows === 0) {
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
export const addData = async (userId: number, payload: any) => {
  try {
    const {
      IndentNo,
      ItemDesc,
      VendorCode,
      OrderDate,
      OrderLineNo,
      ItemCode,
      SectionHead,
      CountryCode,
      ItemDeno,
      MonthsShelfLife,
      CRPCategory,
      VEDCCategory,
      ABCCategory,
      DateTimeApproved,
      ApprovedBy,
      ReviewSubSectionCode,
      INCATYN
    } = payload;

    const toNull = (v: any) =>
      v === undefined || v === '' ? null : v;

    const query = `
      INSERT INTO ITEMS_DETAILS (
        userId,
        IndentNo,
        ItemDesc,
        VendorCode,
        OrderDate,
        OrderLineNo,
        ItemCode,
        SectionHead,
        CountryCode,
        ItemDeno,
        MonthsShelfLife,
        CRPCategory,
        VEDCCategory,
        ABCCategory,
        DateTimeApproved,
        ApprovedBy,
        ReviewSubSectionCode,
        INCATYN
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      userId,                 
      toNull(IndentNo),
      toNull(ItemDesc),
      toNull(VendorCode),
      toNull(OrderDate),
      toNull(OrderLineNo),
      toNull(ItemCode),
      toNull(SectionHead),
      toNull(CountryCode),
      toNull(ItemDeno),
      toNull(MonthsShelfLife),
      toNull(CRPCategory),
      toNull(VEDCCategory),
      toNull(ABCCategory),
      toNull(DateTimeApproved),
      toNull(ApprovedBy),
      toNull(ReviewSubSectionCode),
      toNull(INCATYN),
    ]);

    return {
      success: true,
      data: {
        id: result.insertId,
        userId,
        ...payload
      }
    };

  } catch (error: any) {
    console.error("Error in addData:", error);
    throw error;
  }
};





// export const getPaginatedData = async (
//   page: number = 1,
//   limit: number = 50
// ) => {
//   try {
//     const offset = (page - 1) * limit;

//     const [rows]: any = await pool.query(
//       `
//       SELECT *
//       FROM ITEMS_DETAILS
//       ORDER BY id ASC
//       LIMIT ? OFFSET ?
//       `,
//       [limit, offset]
//     );

//     const [[countResult]]: any = await pool.query(
//       `SELECT COUNT(*) as total FROM ITEMS_DETAILS`
//     );

//     return {
//       success: true,
//       data: rows,
//       pagination: {
//         page,
//         limit,
//         totalRecords: countResult.total,
//         totalPages: Math.ceil(countResult.total / limit)
//       },
//       message: "Data fetched successfully"
//     };

//   } 
//   catch (error: any) {
//     console.error("Error in getPaginatedData:", error);
//     throw new Error("Failed to fetch paginated Item Details");
//   }
// };



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
        WHERE TABLE_NAME = 'items_DETAILS'
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
      FROM items_DETAILS
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
      FROM items_DETAILS
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
