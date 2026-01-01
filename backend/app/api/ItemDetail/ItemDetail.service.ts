import xlsx from "xlsx";
import { pool } from "../../common/services/sql.service";
import { ItemImportDTO } from "./ItemDetail.dto";

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

  await pool.query(query, [insertValues]);

  return {
    totalInserted: validatedRows.length,
    message: "Excel imported successfully",
  };
};

export const getAllData = async () => {
  try {
    console.log("hello")
    const [rows] = await pool.query("SELECT * FROM ITEMS_DETAILS ORDER BY id ASC");
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

    const [result]: any = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    // Fetch and return the updated record
    const [updatedRows]: any = await pool.query(
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
    const [result]: any = await pool.query(query, [id]);

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

export const addData = async (userId: number, payload: any) => {
  try {
    const {
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
      ABCCategory
    } = payload;

    if (!ItemDesc || !VendorCode || !OrderDate || !ItemCode) {
      throw new Error("Missing required fields");
    }

    const query = `
      INSERT INTO ITEMS_DETAILS 
      (userId, ItemDesc, VendorCode, OrderDate, OrderLineNo, ItemCode, 
       SectionHead, CountryCode, ItemDeno, MonthsShelfLife, 
       CRPCategory, VEDCCategory, ABCCategory)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result]: any = await pool.query(query, [
      userId,  // Use the userId from function parameters
      ItemDesc,
      VendorCode,
      new Date(OrderDate),
      OrderLineNo || null,
      ItemCode,
      SectionHead || null,
      CountryCode || null,
      ItemDeno || null,
      MonthsShelfLife ? parseInt(MonthsShelfLife) : null,
      CRPCategory || null,
      VEDCCategory || null,
      ABCCategory || null
    ]);

    if (!result.insertId) {
      throw new Error("Failed to insert record");
    }

    return {
      success: true,
      data: {
        id: result.insertId,
        userId,  // Include userId in the response
        ...payload
      }
    };

  } catch (error: any) {
    console.error("Error in addData:", error);
    throw new Error("Failed to add record: " + error.message);
  }
};