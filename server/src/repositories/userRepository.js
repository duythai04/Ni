import { getPool } from "../config/db.js";

const formatMySQLDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid refresh token expiration date");
  }

  return date.toISOString().slice(0, 19).replace("T", " ");
};

export const userRepository = {
  async findByEmail(email) {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const pool = await getPool();
    const [rows] = await pool.query(
      "SELECT id, full_name, email, avatar_url, role, created_at, updated_at FROM users WHERE id = ?",
      [id],
    );
    return rows[0] || null;
  },

  async create({
    id,
    full_name,
    email,
    password_hash,
    avatar_url,
    role = "student",
  }) {
    const pool = await getPool();

    await pool.query(
      "INSERT INTO users (id, full_name, email, password_hash, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, full_name, email, password_hash, avatar_url || null, role],
    );

    return this.findById(id);
  },

  async update(id, { full_name, avatar_url }) {
    const pool = await getPool();
    const updates = [];
    const params = [];

    if (full_name !== undefined) {
      updates.push("full_name = ?");
      params.push(full_name);
    }

    if (avatar_url !== undefined) {
      updates.push("avatar_url = ?");
      params.push(avatar_url);
    }

    if (updates.length > 0) {
      params.push(id);

      await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    return this.findById(id);
  },

  async saveRefreshToken(userId, tokenHash, expiresAt) {
    const pool = await getPool();

    const formattedExpiresAt = formatMySQLDateTime(expiresAt);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [userId, tokenHash, formattedExpiresAt],
    );
  },

  async findRefreshToken(tokenHash) {
    const pool = await getPool();

    const [rows] = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP()",
      [tokenHash],
    );

    return rows[0] || null;
  },

  async deleteRefreshToken(tokenHash) {
    const pool = await getPool();

    await pool.query("DELETE FROM refresh_tokens WHERE token_hash = ?", [
      tokenHash,
    ]);
  },

  async deleteUserRefreshTokens(userId) {
    const pool = await getPool();

    await pool.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
  },
};
