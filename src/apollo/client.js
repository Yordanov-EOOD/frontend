import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_PROD
    : process.env.REACT_APP_DEV
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? token : ""
    }
  };
});

const cache = new InMemoryCache();

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
});

const getInitialState = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      isLoggedIn: !!token,
      user: user
    };
  } catch (err) {
    // Reset corrupted state
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return {
      isLoggedIn: false,
      user: null
    };
  }
};

cache.writeData({
  data: getInitialState()
});

export default client;
