import { Database } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { GQLError } from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";
import { GraphQLError } from "https://deno.land/x/oak_graphql@0.6.2/deps.ts";

import { UserSchema, CommentSchema } from "../mongo/schema.ts";

import { IUser, IComment, IContext } from "../types.ts";

const Post = {
  author: async (
    parent: { author: string },
    args: any,
    ctx: IContext
  ): Promise<IUser | null> => {
    const db: Database = ctx.db;
    const UsersCollection = db.collection<UserSchema>("UsersCollection");

    const user = await UsersCollection.findOne({ name: parent.author });
    return user;
  },

  comment: async (
    parent: { comment: string },
    args: any,
    ctx: IContext
  ): Promise<IComment | null> => {
    const db: Database = ctx.db;
    const CommentsCollection = db.collection<CommentSchema>(
      "CommentsCollection"
    );

    const comment = await CommentsCollection.findOne({ text: parent.comment });
    return comment;
  },
};

export { Post };
