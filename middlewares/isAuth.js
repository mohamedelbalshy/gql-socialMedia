const jwt = require("jsonwebtoken");
const SECRETKEY = "SECRET KEY ";

const isAuth = (context) => {
  context.headers.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImVtYWlsIjoieHl6QHh5ei5jb20iLCJ1c2VybmFtZSI6ImJhbHNoeSIsImlhdCI6MTYyMTAxMDAyNH0.wFjfCiKeLGgxeXKkySm2K2QekOx0WYY4vMyQRhfvr_8";
  const token = context.headers.token;
  if (token) {
    const user = jwt.verify(token, SECRETKEY);
    if (!user) {
      throw new Error("Can not verify the token");
    }
    return user;
  }
  throw new Error("Please Provide the token to the headers");
};

module.exports = isAuth;
