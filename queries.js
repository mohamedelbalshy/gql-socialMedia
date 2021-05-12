const Pool = require("pg").Pool;
const pool = new Pool({
  user: "balshy2",
  host: "localhost",
  database: "gql_social_media",
  password: "01015927673a",
  port: 5432,
});

const bcrypt = require("bcrypt");

const getPosts = async () => {
  try {
    const results = await pool.query(
      "SELECT * FROM posts ORDER BY created_at ASC"
    );
    return results.rows;
  } catch (error) {
    console.log(error);
  }
};

const getPostById = async (id) => {
  try {
    const results = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    return results.rows;
  } catch (error) {
    console.error(error);
  }
};

const getUserById = async (id) => {
  try {
    const results = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return results.rows;
  } catch (error) {
    console.error(error);
  }
};

const getUserByEmail = async (email) => {
  try {
    const results = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    console.log(results.rows);
    return results.rows;
  } catch (error) {
    console.error(error);
  }
};

// we need to hash the password before inserting into the databse

const addUser = async (email, password, username) => {
  try {
    password = await bcrypt.hash(password, 10);
    const users = await pool.query(
      "INSERT INTO users (email, password, username, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, password, username, new Date()]
    );
    return users.rows[0];
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  getUserById,
  getUserByEmail,
  addUser,
};
