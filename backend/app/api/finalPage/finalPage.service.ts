import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { page } from "./finalPage.dto";


export const createPage = async (data: page) => {
    try {
        const query = "INSERT INTO certificate  (content) VALUES (?)";
        const values = [data.content];
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
        WHERE TABLE_NAME = 'certificate '
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
