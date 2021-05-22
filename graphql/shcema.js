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

const { getPostById } = require("./resolvers");

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    user: {
      type: UserType,
      async resolve(parent, args) {
        return await db.getUserById(parent.user_id);
      },
    },
    body: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: new GraphQLNonNull(GraphQLString) },
    likes: { type: new GraphQLNonNull(GraphQLInt) },
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent, args) {
        return await db.getCommentsByPost(parent.id);
      },
    },
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

const CommentType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    user: {
      type: UserType,
      async resolve(parent, args) {
        return await db.getUserById(parent.user_id);
      },
    },
    post: {
      type: PostType,
      async resolve(parent, args) {
        const post = await db.getPostById(parent.post_id);
        return post;
      },
    },
    body: { type: new GraphQLNonNull(GraphQLString) },
    created_at: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

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
