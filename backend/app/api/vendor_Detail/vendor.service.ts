import { pool } from '../../common/services/sql.service';
import { vendor } from "./vendor.dto";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";

export const add = async(userId: number, payload: any) => {
    try {
        const query = `INSERT INTO vendor_Detail(userId, FirmName, FirmAddress, vendorCode, FirmEmailId) 
                      VALUES(?, ?, ?, ?, ?)`;
        
        // Convert undefined values to null
        const values = [
            userId,
            payload.FirmName || null,
            payload.FirmAddress || null,
            payload.vendorCode || null,
            payload.FirmEmailId || null
        ];

        const [row]: any = await pool.execute<ResultSetHeader>(query, values);
        return {
            success: true,
            message: "Record added successfully",
            data: row
        };
    } catch (error: any) {
        console.error('Error in vendor service add:', error);
        throw error; 
    }
}

export const deleteData = async(Id:number)=>{
    try{
        const query = `Delete from vendor_Detail where id = ?`;
        const value = [Id];
        const row = await pool.execute<ResultSetHeader>(query,value);
        return {
            success: true,
            message: "Record deleted successfully",
            data: row
        }
    }
    catch(error:any){
        console.log(error)
        throw new Error(error)
    }
}

export const updateData = async (
  payload: Partial<vendor>,
  Id: number,
  userId: number
) => {
  try {
    
    const filteredPayload = Object.entries(payload).reduce((acc, [key, value]) => {
      acc[key] = value !== undefined ? value : null;
      return acc;
    }, {} as Record<string, any>);

    
    const updateFields: Partial<vendor> = {
      ...filteredPayload,
      updateBy: userId  
    };

    
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key as keyof vendor] === undefined) {
        delete updateFields[key as keyof vendor];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        message: "No valid fields to update"
      };
    }

    const setClause = Object.keys(updateFields)
      .filter(key => key !== 'id') 
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [
      ...Object.values(updateFields).filter((_, i) => Object.keys(updateFields)[i] !== 'id'),
      Id
    ];

    const query = `
      UPDATE vendor_Detail
      SET ${setClause}
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "No record found with the given ID"
      };
    }

    const [updatedRecord] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM vendor_Detail WHERE id = ?",
      [Id]
    );

    return {
      success: true,
      message: "Record updated successfully",
      data: updatedRecord[0]
    };
  } catch (error: any) {
    console.error('Error in vendor service updateData:', error);
    return {
      success: false,
      message: error.message || "Update failed",
      error: error
    };
  }
};

// export const getAll = async()=>{
//     try{
//         const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM vendor_Detail order By id ASC");
//         return {
//             success: true,
//             message: "Record fetched successfully",
//             data: rows
//         }
//     }
//     catch(error:any){
//         console.log(error)
//         throw new Error(error)
//     }
// }

export const getByVendorCode = async(vendorCode:string)=>{
  try{
    const query = "Select * from vendor_Detail where vendorCode = ? "
    const[row] =  await pool.execute<RowDataPacket[]>(query,[vendorCode])
    if(!row || row.length == 0 || row.length== null){
      return {
        success: false,
        message: "No record found with the given vendor code"
      }
    }
    return {
      success: true,
      message: "Record fetched successfully",
      data: row
    }
  }
  catch(error:any){
    console.log(error)
    throw new Error(error)
  }
}






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
        WHERE TABLE_NAME = 'vendor_Detail'
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
      FROM vendor_Detail
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
      FROM vendor_Detail
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
