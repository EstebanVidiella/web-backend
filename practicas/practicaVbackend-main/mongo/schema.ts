export interface PostSchema {
  _id: { $oid: string };
  title: string;
  body: string;
  author: string;
  comment: string;
}

export interface UserSchema {
  _id: { $oid: string };
  name: string;
  rol: string;
  token: string;
  password: string;
}

export interface CommentSchema {
  _id: { $oid: string };
  text: string;
  author: string;
  post: string;
}