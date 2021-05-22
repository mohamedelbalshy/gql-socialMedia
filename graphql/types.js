const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
} = require("graphql");

const db = require("../queries");

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

module.exports = {
  PostType,
  CommentType,
  UserType,
};
