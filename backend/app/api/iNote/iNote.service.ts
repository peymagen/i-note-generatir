import { type Inote } from "./iNote.dto";
import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";


export const getlastRow = async () => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM i_note ORDER BY id DESC LIMIT 1"
        );
        console.log("Rows from getlastRow:", rows);

        if (rows.length === 0) {
            return { iNote: 1 };
        }

        return { iNote: rows[0].iNote + 1 };

    } catch (error) {
        console.error("Error in getlastRow:", error);
    }
};

export const insertLatestInote = async (iNote: Inote) => {
    try {
        const sql = "INSERT INTO i_note (iNote) VALUES (?)";
        const [result] = await pool.execute<ResultSetHeader>(sql, [iNote.iNote]); // ← .iNote
        return { action: "created", id: result.insertId };
    } catch (error) {
        console.error("Error in insertLatestInote:", error);
        throw error;
    }
};

export const getLastInote = async()=>{
    try{

        const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM i_note ORDER BY id DESC LIMIT 1");
       
        if(rows.length === 0){
             return null
        }
        else{
            return {
                iNote: rows[0].iNote, 
                id: rows[0].id
            };
        }
    }
    catch(error){
        console.log(error);
    }
}

export const createUpdate = async (iNote: Inote,id:number) => {
    try {
        
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT id FROM i_note ORDER BY id DESC LIMIT 1"
        );

        if (rows.length === 0) {
          
            const sql = "INSERT INTO i_note (iNote) VALUES (?)";
            const [result] = await pool.execute<ResultSetHeader>(sql, [iNote]);
            return { action: "created", id: result.insertId };
        } else {
            const sql = "UPDATE i_note SET iNote = ? WHERE id = ?";
            const [result] = await pool.execute<ResultSetHeader>(sql, [iNote, id]);
            return { action: "updated", id: id };
        }
    } catch (error) {
        console.error("Error in createUpdate:", error);
        throw error;
    }
};


