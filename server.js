const express = require("express");
const { graphqlHTTP } = require("express-graphql");

const app = express();

const port = 3000;

const schema = require("./graphql/shcema");

app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: req,
  }))
);

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`);
});
