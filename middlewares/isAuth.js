const jwt = require("jsonwebtoken");
const SECRETKEY = "SECRET KEY ";

const isAuth = (context) => {
  // this is hardcoded token to test with
  context.headers.token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjQsImVtYWlsIjoiYmFsc2h5QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiYmFsc2h5IiwiaWF0IjoxNjIxMDM2MjQ2fQ.Qhz4qkkgFogUdHRo-DK_1ACVw6q4IdmRN9IRT-W8kl0";
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
