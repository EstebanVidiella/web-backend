import { Database } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { GQLError } from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";
import { GraphQLError } from "https://deno.land/x/oak_graphql@0.6.2/deps.ts";

import { PostSchema, CommentSchema } from "../mongo/schema.ts";

import { IContext, IPost, IUser, IComment } from "../types.ts";

const User = {
  post: async (
    parent: IUser,
    args: any,
    ctx: IContext
  ): Promise<IPost[] | null> => {
    const db: Database = ctx.db;
    const PostsCollection = db.collection<PostSchema>("PostsCollection");

    const posts = await PostsCollection.find({ author: parent.name });
    return posts.map((t) => {
      return {
        ...t,
      };
    });
  },

  comment: async (
    parent: IUser,
    args: any,
    ctx: IContext
  ): Promise<IComment[] | null> => {
    const db: Database = ctx.db;
    const CommentsCollection = db.collection<CommentSchema>(
      "CommentsCollection"
    );

    const posts = await CommentsCollection.find({ author: parent.name });
    return posts.map((t) => {
      return {
        ...t,
      };
    });
  },
};

export { User };
