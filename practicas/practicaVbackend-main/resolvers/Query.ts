import { Database } from "https://deno.land/x/mongo@v0.12.1/mod.ts";
import { GQLError } from "https://deno.land/x/oak_graphql@0.6.2/mod.ts";

import { PostSchema, UserSchema } from "../mongo/schema.ts";

import { IPost, IContext } from "../types.ts";

const Query = {
  getPosts: async (parent: any, args: any, ctx: IContext) => {
    try {
      const db: Database = ctx.db;
      const postsCollection = db.collection<PostSchema>("PostsCollection");
      const posts = await postsCollection.find();
      const result = posts.map((t) => {
        return {
          ...t,
        };
      });
      return result;
    } catch (e) {
      throw new GQLError(e);
    }
  },
};

export { Query };
