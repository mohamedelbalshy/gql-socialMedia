const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("../queries");

const SECRETKEY = "SECRET KEY ";

const getPostById = async (user_id) => {
  const user = await db.getUserById(user_id);
  return user;
};

const login = async (email, password) => {
  const users = await db.getUserByEmail(email);
  const user = users[0];
  if (!user) {
    throw new Error("This Email not registered in our database");
  }
  const correctPassword = await bcrypt.compareSync(password, user.password);
  if (!correctPassword) {
    throw new Error("Wrong password");
  }

  const token = await jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRETKEY
  );
  delete user.password;
  user.token = token;
  return user;
};

const register = async (email, password, confirmPassword, username) => {
  if (password !== confirmPassword) {
    throw new Error("password not match");
  }
  const users = await db.getUserByEmail(email);
  if (users.length > 0) {
    throw new Error("this email is taken");
  }
  const user = await db.addUser(email, password, username);

  const token = await jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRETKEY
  );
  delete user.password;
  user.token = token;
  return user;
};

module.exports = {
  getPostById,
  login,
  register,
};
