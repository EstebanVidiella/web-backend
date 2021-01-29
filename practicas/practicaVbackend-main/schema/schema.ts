import { gql } from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";

const Schema = gql`
  type User {
    email: String!
    rol: String!
    token: String!
    post: [Post!]!
    comment: [Comment!]!
  }
  type Post {
    title: String!
    body: String!
    author: User!
    comment: [Comment!]!
  }
  type Comment {
    text: String!
    author: [User!]!
    post: [Post!]!
  }
  input PostInput {
    title: String!
    body: String!
    author: String
    comment: String
  }
  type Query {
    getPosts: [Post!]!
  }
  type Mutation {
    addUser(name: String!, password: String!, rol: String!): Boolean!
    deleteUser(name: String!, rol: String!): Boolean!
    addPost(post: PostInput!): Boolean!
    removeSelfPost(title: String!): Boolean!
    removeAnyPost(title: String!): Boolean!
    addComment(text: String!, post: String!): Boolean!
    removeSelfComment(text: String!, post: String!): Boolean!
    removeAnyComment(text: String!, post: String!): Boolean!
    logIn(name: String!, password: String!): String!
    logOut: Boolean!
  }
`;

export { Schema };
