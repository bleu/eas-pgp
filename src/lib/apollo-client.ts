import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  // TODO: it should be an environment variable
  link: new HttpLink({ uri: "https://sepolia.easscan.org/graphql" }),
  cache: new InMemoryCache(),
});

export default client;
