import pool from "../config/db.js";

//  FIND USER BY NOMOR WHATSAPP
export const findUserByWhatsapp = async (nomor_whatsapp) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE nomor_whatsapp = $1",
    [nomor_whatsapp]
  );
  return rows[0];
};

//  FIND USER BY ID
export const findUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, username, nomor_whatsapp, role, avatar_url, created_at 
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
};

// GET USER PREMIUM UNTIL
export const getUserPremiumUntilById = async (id) => {
  const { rows } = await pool.query(
    `SELECT premium_until FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
};

//  CREATE USER
export const createUser = async ({
  username,
  nomor_whatsapp,
  password,
  role,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO users (username, nomor_whatsapp, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, nomor_whatsapp, role`,
    [username, nomor_whatsapp, password, role]
  );

  return rows[0];
};

//  UPDATE USER PROFILE
export const updateUserProfile = async (
  id,
  { username, nomor_whatsapp, avatar_url }
) => {
  const { rows } = await pool.query(
    `UPDATE users 
     SET 
        username = COALESCE($1, username),
        nomor_whatsapp = COALESCE($2, nomor_whatsapp),
        avatar_url = COALESCE($3, avatar_url)
     WHERE id = $4
     RETURNING id, username, nomor_whatsapp, role, avatar_url`,
    [username, nomor_whatsapp, avatar_url, id]
  );

  return rows[0];
};

//  SAVE AVATAR ONLY
export const saveAvatar = async (id, url) => {
  await pool.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [url, id]);
};
