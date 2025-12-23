import { type IUser } from "./user.dto";
import { pool } from "../../common/services/sql.service";
import { type RowDataPacket, type ResultSetHeader } from "mysql2";
import { hash, compare } from 'bcrypt';


export const createUser = async (data: IUser) => {
  try{
    const query = "INSERT INTO users (name,email, password) VALUES (?, ?, ?)";
    const values = [data.name, data.email, data.password];
    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return { userId: result.insertId };
  }
  catch(error){
    console.log(error);
    return null;
  }
};

export const updateUser = async (id: number, data: IUser) => {
  try{
    const query = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
    const values = [data.name, data.email, data.password, id];
    await pool.execute(query, values);
    return { id, ...data };
  }
  catch(error){
    console.log(error);
    return null;
  }
};

// export const editUser = async (
//   id: number,
//   data: IUser
// ): Promise<IUser & { id: number }> => {
//   let query = "UPDATE users SET ";
//   const updates: string[] = [];
//   const values: any[] = [];

//   Object.keys(data).forEach((key) => {
//     updates.push(`${key} = ?`);
//     values.push((data as any)[key]);
//   });

//   query += updates.join(", ") + " WHERE id = ?";
//   values.push(id);

//   try{
//     await pool.execute(query, values);
//     return { id, ...data };
//   }
//   catch(error){
//     console.log(error);
//     return undefined;
//   }
// };

export const deleteUser = async (id: number) => {
  try{
    const query = "DELETE FROM users WHERE id = ?";
    await pool.execute(query, [id]);
    return { id, deleted: true };
  }
  catch(error){
    console.log(error);
    return undefined;
  }
};

export const toggleUserStatus = async (id: number): Promise<{ id: number; isActive: boolean }> => {
  try {
    const query = "SELECT is_active FROM users WHERE id = ?";
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    console.log(rows);
    
    if (!rows || rows.length === 0) {
      throw new Error('User not found');

    }
    
    const currentStatus = Boolean(rows[0].is_active);
    const newStatus = !currentStatus;
    
    const updateQuery = "UPDATE users SET is_active = ? WHERE id = ?";
    await pool.execute(updateQuery, [newStatus ? 1 : 0, id]);
    
    return { id, isActive: newStatus };
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const getUserById = async (id: number) => {
  try{
    const query = "SELECT name,email FROM users WHERE id = ?";
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    return rows[0] || null;
  }
  catch(error){
    console.log(error);
    return null;
  }
};

export const getAllUsers = async () => {
  try{
    const query = "SELECT id,name,email,is_active FROM users";
    const [rows] = await pool.execute(query);
    console.log(rows);
    return rows;
  }
  catch(error){
    console.log(error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  try{
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as IUser;
    }
    return null;
  }
  catch(error){
    console.log(error);
    return null;
  }
};




export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    // 1. Get user's current password hash
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT password FROM users WHERE id = ?", 
      [userId]
    );
    
    if (!rows.length) {
      throw new Error('User not found');
    }

    // 2. Verify current password
    const isMatch = await compare(currentPassword, rows[0].password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // 3. Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // 4. Update password
    await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, userId]
    );

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};