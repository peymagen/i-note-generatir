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

export const getAll = async()=>{
    try{
        const [rows] = await pool.execute<RowDataPacket[]>("SELECT * FROM vendor_Detail order By id ASC");
        return {
            success: true,
            message: "Record fetched successfully",
            data: rows
        }
    }
    catch(error:any){
        console.log(error)
        throw new Error(error)
    }
}

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