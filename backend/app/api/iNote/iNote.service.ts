import { type Inote } from "./iNote.dto";
import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";


export const getlastRow = async () => {
    try {
        
        const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM i_note LIMIT 1");

        if (rows.length === 0) {
            await pool.query<ResultSetHeader>("INSERT INTO i_note (iNote) VALUES (default)");
        } else {
            await pool.query<ResultSetHeader>(
                "INSERT INTO i_note (iNote) SELECT iNote + 1 FROM i_note ORDER BY id DESC LIMIT 1"
            );
        }
        const [latestRows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM i_note ORDER BY id DESC LIMIT 1"
        );
        
        return latestRows[0];

    } catch (error) {
        console.error("Error in getlastRow:", error);
        throw error;
    }
};