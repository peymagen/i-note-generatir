import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { page } from "./finalPage.dto";


export const createPage = async (data: page) => {
  
    try {
        const query = "INSERT INTO certificate  (content,i_note,indent_No,products_data) VALUES (?,?,?,?)";
        const values = [data.content,data.i_note,data.indent_no,data.products_data || null];
        const [result] = await pool.execute<ResultSetHeader>(query, values);
        return { pageId: result.insertId };
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getPageById = async (id: number) => {
    try {
        const query = "SELECT content FROM certificate  WHERE id = ?";
        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.log(error);
        return null;
    }
};


export const updatePage = async (id: number, data: page) => {
    try {
      
        const query = "UPDATE certificate  SET content = ? WHERE id = ?";
        const values = [data.content,id];
        const [result] = await pool.execute(query, values);
        
        if(!result){
            return null
        }
        else{
            return { id, ...data };
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const deletePageById= async(id:number)=>{
  try{
    // 1. Fetch the certificate to see if it has products_data
    const selectQuery = "SELECT products_data FROM certificate WHERE id = ?";
    const [rows]: any = await pool.execute(selectQuery, [id]);
    
    if (rows && rows.length > 0 && rows[0].products_data) {
      try {
        let products = rows[0].products_data;
        if (typeof products === 'string') {
          products = JSON.parse(products);
        }
        console.log("Product Data:",products)
        // 2. Revert quantities in po_details
        if (Array.isArray(products)) {
          for (const p of products) {
            if (p.id && p.incrementQty) {
              const revertQuery = "UPDATE po_details SET QtyFullFill = GREATEST(0, IFNULL(QtyFullFill, 0) - ?) WHERE id = ?";
              await pool.execute(revertQuery, [p.incrementQty, p.id]);
            }
          }
        }
      } catch (parseError: any) {
        // console.error("Error parsing/reverting products_data:", parseError);
        // Abort deletion if reverting fails
        return { success: false, message: "Failed to revert product quantities: " + parseError.message };
      }
    }

    // 3. Delete the certificate
    const query = "DELETE FROM certificate  WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return {result, id, success: true };
  }
  catch(error){
    console.log(error);
    return null;
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
        WHERE TABLE_NAME = 'certificate'
          AND DATA_TYPE IN ('varchar', 'text', 'char','LONGTEXT')
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
      FROM certificate 
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
      FROM certificate 
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
