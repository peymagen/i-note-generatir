import { pool } from "../../common/services/sql.service";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { IPage } from "./page.dto";

// Create Page
export const createPage = async (data: { title: string; content: string ,userId: number}) => {
  try {
    // const id = "page_" + Date.now();
    const query = "INSERT INTO pages (title, content, created_by) VALUES (?, ?, ?)";
    const values = [data.title, data.content, data.userId];


    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return { id :result.insertId };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Update Page
export const updatePage = async (
  id: string,
  data: Partial<Pick<IPage, "title" | "content">>
) => {
  try {
    const query = "UPDATE pages SET title = ?, content = ? WHERE id = ?";
    const pageId = Number(id);
    const values = [data.title, data.content, pageId];

    console.log("Updating page with ID:", pageId, "Values:", values);

    const [result] = await pool.execute<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return { id, ...data };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Delete Page
export const deletePage = async (id: string) => {
  try {
    const query = "DELETE FROM pages WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    if (result.affectedRows === 0) {
      return null;
    }

    return { id, deleted: true };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get page by ID
export const getPageById = async (id: string): Promise<IPage | null> => {
  try {
    const query = "SELECT * FROM pages WHERE id = ?";
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (!rows.length) return null;

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdOn: row.createdOn,
      updatedOn: row.updatedOn,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get all pages
export const getAllPages = async () => {
  try {
    const query = "SELECT id, title, created_on, updated_on FROM pages ORDER BY ID ASC";
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    console.log(rows)
    return rows;
  } catch (error) {
    console.log(error);
    return [];
  }
};
