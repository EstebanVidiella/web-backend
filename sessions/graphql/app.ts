import {
  Application,
  Router,
  RouterContext,
} from "https://deno.land/x/oak@v6.2.0/mod.ts";

import {
  applyGraphQL,
  gql,
  GQLError,
} from "https://deno.land/x/oak_graphql/mod.ts";

interface IUser {
  firstName: string;
  lastName: string;
  id: string;
}

const users: IUser[] = [];
const app = new Application();

const types = gql`
  type User {
    firstName: String
    lastName: String
  }

  input UserInput {
    firstName: String
    lastName: String
    id: String
  }

  type ResolveType {
    done: Boolean
  }

  type Query {
    getUser(id: String): User
    getUsers: [User]!
  }

  type Mutation {
    setUser(input: UserInput!): ResolveType!
    clearUsers: ResolType!
  }
`;

const resolvers = {
  Query: {
    getUser: (
      parent: any,
      args: { id: string },
      context: { users: IUser[] },
      info: any
    ) => {
      const id = args.id;
      const users: IUser[] = context.users;
      const user: IUser | undefined = users.find((usr) => usr.id === id);
      return user;
    },
    getUsers: (
      parent: any,
      args: {},
      context: { users: IUser[] },
      info: any
    ) => {
      return context.users;
    },
  },
  Mutation: {
    setUser: (
      parent: any,
      args: any,
      context: { users: IUser[] },
      info: any
    ) => {
      const users: IUser[] = context.users;
      users.push(args.input);
      return {
        done: true,
      };
    },
    clearUsers: (
      parent: any,
      args: any,
      context: { users: IUser[] },
      info: any
    ) => {
      context.users = [];
      return { done: true };
    },
  },
};

const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs: types,
  resolvers: resolvers,
  context: (ctx: RouterContext) => {
    return { users };
  },
});

app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:8080");
await app.listen({ port: 8080 });
