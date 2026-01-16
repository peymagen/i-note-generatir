import { type Inote } from "./iNote.dto";
import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { Response } from "express";


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

export const getLastInote = async()=>{
    try{

        const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM i_note ORDER BY id DESC LIMIT 1");
        console.log(rows);
        // console.log(rows.iNote)
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


// Example usage in your controller
// const handleSave = async (req, res) => {
//     const { iNoteValue } = req.body; // e.g., 202501

//     try {
//         const result = await createUpdate(iNoteValue);
        
//         if(result.action === "created") {
//             res.json({ msg: "New I-Note sequence started" });
//         } else {
//             res.json({ msg: "Last I-Note updated" });
//         }
//     } catch (e) {
//         res.status(500).send("Error");
//     }
// }