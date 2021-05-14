const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");
const bcrypt = require("bcrypt");

const db = require("../queries");

const jwt = require("jsonwebtoken");
const SECRETKEY = "SECRET KEY ";

const isAuth = require("../middlewares/isAuth");

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    username: {
      type: UserType,
      async resolve(parent, args) {
        // console.log(parent, "Parent");
        const user = await db.getUserByUsername(parent.username);
        console.log(user);
        return user;
      },
    },
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
    token: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args, context) => {
        console.log("context", context.headers);
        const posts = await db.getPosts();
        return posts;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (parent, args) => {
        const users = await db.getUsers();
        return users;
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
      async resolve(parent, args, context) {
        const { email, password, confirmPassword, username } = args;
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
      },
    },
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },

      async resolve(parent, args) {
        const { email, password } = args;
        const users = await db.getUserByEmail(email);
        const user = users[0];
        if (!user) {
          throw new Error("This Email not registered in our database");
        }
        const correctPassword = await bcrypt.compareSync(
          password,
          user.password
        );
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
      },
    },

    addPost: {
      type: PostType,
      args: {
        body: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args, context) {
        const { body } = args;
        const user = isAuth(context);
        if (!user) {
          throw new Error("This User not found");
        }

        const post = await db.addPost(body, user.username);
        return post;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
