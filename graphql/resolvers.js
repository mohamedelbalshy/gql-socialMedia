const db = require("../queries");

const getPostById = async (user_id) => {
  const user = await db.getUserById(user_id);
  return user;
};

module.exports = {
  getPostById,
};
