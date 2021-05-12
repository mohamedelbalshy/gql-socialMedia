const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");

const db = require("../queries");

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: new GraphQLNonNull(GraphQLString) },
    body: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args) => {
        const posts = await db.getPosts();
        return posts;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    register: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { email, password, confirmPassword, username } = args;
        if (password !== confirmPassword) {
          throw new Error("password not match");
        }
        const users = await db.getUserByEmail(email);
        if (users.length > 0) {
          throw new Error("this email is taken");
        }
        const user = await db.addUser(email, password, username);
        return user;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
