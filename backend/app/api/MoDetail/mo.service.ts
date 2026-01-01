import xlsx from "xlsx";
import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { MoDto } from "./mo.dto";
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
  const validatedRows: MoDto[] = rows.map((row) => {
    const dto: MoDto = {
      userId,
      MoCPRO: row["MO (MATERIAL ORGANISATION)/CPRO"]?.toString() || "",
      MoAddress: row["MO ADDRESS"]?.toString() || "",
    };
    return dto;
  });

  // Update the query to match your PoDto fields
  const insertValues = validatedRows.map((r) => [
    r.userId,
    r.MoAddress,
    r.MoCPRO
  ]);

  const query = `
    INSERT INTO MO_DETAILS (
      userId,
      MoAddress,
      MoCPRO
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
    const [rows] = await pool.execute<ResultSetHeader>("SELECT * FROM MO_DETAILS ORDER BY id ASC");
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
      "SELECT * FROM MO_DETAILS WHERE id = ?",
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
      UPDATE MO_DETAILS 
      SET ${setClause}
      WHERE id = ?
    `;

    const [result]: any = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Record not found"
      };
    }

    // Fetch and return the updated record
    const [updatedRows]: any = await pool.query(
      "SELECT * FROM MO_DETAILS WHERE id = ?",
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
      "DELETE FROM MO_DETAILS WHERE id = ?",
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
      "INSERT INTO MO_DETAILS (userId, MoAddress, MoCPRO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        payload.MoAddress,
        payload.MoCPRO,
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

export const getDatabyCon = async(consignee: string) => {
  try {
    const query = 
      `SELECT *
      FROM mo_details
      WHERE MoCPRO = 'MO(' + ? + ')'
        OR MoCPRO   = 'CPRO(' + ? + ')';`
    ;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [consignee, consignee]);
//     console.log(`
      // SELECT *
      // FROM mo_details
      // WHERE MoCPRO = 'MO(${consignee})'
      //    OR CPRO   = 'CPRO(${consignee})'
      // `,);

    // console.log("Query result:", rows);  
    
    if (!rows || rows.length === 0) {
      console.log("No rows found for consignee:", consignee);
      return {
        success: false,
        message: "No record found with the given code"
      };
    }
    
    return {
      success: true,
      data: rows
    };
  } catch (error) {
    console.error("Error in getDatabyCon service:", error);
    return {
      success: false,
      message: "Database error occurred",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}