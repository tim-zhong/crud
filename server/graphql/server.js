const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} = require("graphql");
const app = express();

const users = [{ id: 1, name: "John" }];

const todos = [{ id: 1, userId: 1, content: "Example TODO", done: false }];

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represents a user with todos",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    todos: {
      type: new GraphQLList(TodoType),
      resolve: (user) => todos.filter((todo) => (todo.userId = user.id)),
    },
  }),
});

const TodoType = new GraphQLObjectType({
  name: "Todo",
  description: "This represents a single todo item belong to a user",
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    done: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    user: {
      type: UserType,
      resolve: (todo) => {
        return users.find((user) => (user.id = todo.userId));
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    todo: {
      type: TodoType,
      description: "A single TODO",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => todos.find((todo) => todo.id === args.id),
    },
    todos: {
      type: new GraphQLList(TodoType),
      description: "List of TODO's",
      resolve: () => todos,
    },
    user: {
      type: UserType,
      description: "A single user",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => users.find((user) => user.id === args.id),
    },
    users: {
      type: new GraphQLList(UserType),
      description: "List of users",
      resolve: () => users,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addTodo: {
      type: TodoType,
      description: "Add a TODO",
      args: {
        content: {
          type: new GraphQLNonNull(GraphQLString),
        },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (_, args) => {
        const todo = {
          id: todos.length + 1,
          content: args.content,
          userId: args.userId,
        };
        todos.push(todo);
        return todo;
      },
    },
    addUser: {
      type: UserType,
      description: "Add a user",
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_, args) => {
        const user = {
          id: users.length + 1,
          name: args.name,
        };
        users.push(user);
        return user;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("Server Running"));
