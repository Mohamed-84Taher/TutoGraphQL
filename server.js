const express = require("express");
const expressGraphQl = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");
const app = express();

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "helloworld",
//     description: "send message",
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () => "Hello world",
//       },
//     }),
//   }),
// });
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];
const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "this represents a author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: author => {
        return books.filter(book => book.authorId === author.id);
      },
    },
  }),
});
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "this represents a book written by author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: book => {
        return authors.find(author => author.id === book.authorId);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Book Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) => books.find(book => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: "A single Author",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "All of the books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "All of the authors",
      resolve: () => authors,
    },
  }),
});
const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Book mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "add a book",
      args: {
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "add a author",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

app.use(
  "/graph",
  expressGraphQl.graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => console.log("server running"));
