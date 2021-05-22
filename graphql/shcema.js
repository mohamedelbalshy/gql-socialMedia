const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
} = require("graphql");

const bcrypt = require("bcrypt");

const db = require("../queries");

const jwt = require("jsonwebtoken");
const SECRETKEY = "SECRET KEY ";

const isAuth = require("../middlewares/isAuth");

const { getPostById, login, register } = require("./resolvers");

const { PostType, UserType, CommentType } = require("./types");

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args, context) => {
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

    myPosts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, args, context) => {
        const user = isAuth(context);
        if (!user) {
          throw new Error("This User not found");
        }
        return await db.getPostsByUser(user);
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
        const user = await register(email, password, confirmPassword, username);
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
        const user = await login(email, password);
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

        const post = await db.addPost(body, user.id);
        return post;
      },
    },

    addComment: {
      type: CommentType,
      args: {
        body: { type: new GraphQLNonNull(GraphQLString) },
        post_id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(parent, args, context) {
        const { body, post_id } = args;
        const user = isAuth(context);
        if (!user) {
          throw new Error("This User not found");
        }

        const post = await db.addComment(body, user.id, post_id);
        return post;
      },
    },

    likePost: {
      type: PostType,
      args: {
        post_id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(parent, args, context) {
        const { post_id } = args;
        return await db.likePost(post_id);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
