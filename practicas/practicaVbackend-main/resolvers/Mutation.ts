import { Collection, Database } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { GQLError } from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";

import { PostSchema, UserSchema, CommentSchema } from "../mongo/schema.ts";
import { IContext, IUser, IPost } from "../types.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

interface IAddPostArgs {
  post: {
    title: string;
    body: string;
    author: string;
    coments: string;
  };
}

interface IAddCommentArgs {
  text: string;
  author: string;
  post: string;
}

const Mutation = {
  addUser: async (
    parent: any,
    args: { name: string; password: string; rol: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const sameRol = await ctx.db
        .collection<UserSchema>("UsersCollection")
        .findOne({ name: args.name, rol: args.rol });
      if (sameRol) {
        throw new GQLError("User with same rol already in DB");
      }

      await ctx.db.collection<UserSchema>("UsersCollection").insertOne({
        name: args.name,
        password: args.password,
        rol: args.rol,
        token: "",
      });
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  deleteUser: async (
    parent: any,
    args: { name: string; rol: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const UsersCollection = db.collection<UserSchema>("UsersCollection");

      const found = await UsersCollection.findOne({
        name: args.name,
        rol: args.rol,
      });
      if (found) {
        await UsersCollection.deleteOne({ name: args.name, rol: args.rol });
        return true;
      } else {
        throw new GQLError("Unexpected error");
      }
    } catch (e) {
      throw new GQLError(e);
    }
  },

  addPost: async (
    parent: any,
    args: IAddPostArgs,
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await postsCollection.findOne({ title: args.post.title });
      if (found) throw new GQLError("Post already exists.");

      const post = {
        title: args.post.title,
        body: args.post.body,
        author: ctx.user.name,
      };

      await postsCollection.insertOne(post);
      return true;
    } catch (e) {
      console.log(e);
      throw new GQLError(e);
    }
  },

  removeSelfPost: async (
    parent: any,
    args: { title: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await postsCollection.findOne({
        title: args.title,
        author: ctx.user.name,
      });
      if (!found) throw new GQLError("Post does not exist or it is not yours");

      await postsCollection.deleteOne({ title: args.title });
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  removeAnyPost: async (
    parent: any,
    args: { title: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await postsCollection.findOne({ title: args.title });
      if (!found) throw new GQLError("Post title does not exist.");

      await postsCollection.deleteOne({ title: args.title });
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  addComment: async (
    parent: any,
    args: IAddCommentArgs,
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const commentsCollection = db.collection<CommentSchema>(
        "CommentsCollection"
      );
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await postsCollection.findOne({ title: args.post });
      if (!found) throw new GQLError("Post title does not exist.");

      await commentsCollection.insertOne({
        text: args.text,
        author: ctx.user.name,
        post: args.post,
      });
      await postsCollection.updateOne(
        { title: args.post },
        { $set: { comment: args.text } }
      );
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  removeSelfComment: async (
    parent: any,
    args: { text: string; post: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const commentsCollection = db.collection<CommentSchema>(
        "CommentsCollection"
      );
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await commentsCollection.findOne({
        text: args.text,
        post: args.post,
        author: ctx.user.name,
      });
      if (!found)
        throw new GQLError("Comment does not exist or it is not yours.");

      await commentsCollection.deleteOne({ text: args.text, post: args.post });
      await postsCollection.updateOne(
        { title: args.post },
        { $set: { comment: "" } }
      );
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  removeAnyComment: async (
    parent: any,
    args: { text: string; post: string },
    ctx: IContext
  ): Promise<boolean> => {
    try {
      const db: Database = ctx.db;
      const commentsCollection = db.collection<CommentSchema>(
        "CommentsCollection"
      );
      const postsCollection = db.collection<PostSchema>("PostsCollection");

      const found = await commentsCollection.findOne({
        text: args.text,
        post: args.post,
      });
      if (!found) throw new GQLError("Comment does not exist.");

      await commentsCollection.deleteOne({ text: args.text, post: args.post });
      await postsCollection.updateOne(
        { title: args.post },
        { $set: { comment: "" } }
      );
      return true;
    } catch (e) {
      throw new GQLError(e);
    }
  },

  logIn: async (
    parent: any,
    args: { name: string; password: string },
    ctx: IContext
  ): Promise<string> => {
    try {
      const exists = await ctx.db
        .collection<UserSchema>("UsersCollection")
        .findOne({ name: args.name, password: args.password });
      if (exists) {
        const token = v4.generate();
        await ctx.db
          .collection<UserSchema>("UsersCollection")
          .updateOne({ name: args.name }, { $set: { token } });
        return token;
      } else {
        throw new GQLError("User and password do not match");
      }
    } catch (e) {
      throw new GQLError(e);
    }
  },

  logOut: async (parent: any, args: {}, ctx: IContext): Promise<boolean> => {
    try {
      const exists = await ctx.db
        .collection<UserSchema>("UsersCollection")
        .findOne({ name: ctx.user.name, token: ctx.user.token });
      if (exists) {
        await ctx.db
          .collection<UserSchema>("UsersCollection")
          .updateOne({ name: ctx.user.name }, { $set: { token: "" } });
        return true;
      } else {
        throw new GQLError("Unexpected error");
      }
    } catch (e) {
      throw new GQLError(e);
    }
  },
};

export { Mutation };
