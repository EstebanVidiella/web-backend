import { Database } from "https://deno.land/x/mongo@v0.12.1/mod.ts";

export interface IPost {
  title: string;
  body: string;
  author: string;
  comment?: string;
}

export interface IUser {
  name: string;
  rol: string;
  token: string;
  password: string;
}

export interface IComment {
  text: string;
  author: string;
  post: string;
}

export interface IContext {
  db: Database;
  user: IUser;
  comment: IComment;
}