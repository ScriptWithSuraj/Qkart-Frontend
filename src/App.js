import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout"
import Thanks from "./components/Thanks"
import { ThemeProvider } from '@mui/system';
import theme  from './theme';
import React from 'react';
export const config = {
  endpoint: `https://suraj-qkart-frontend.herokuapp.com/api/v1`,
};

function App() {
  return (
    <div className="App">
    {/* <ThemeProvider theme={theme}> */}
      {/* <BrowserRouter> */}
      <Switch>
      <Route path="/register">
          <Register/>
          </Route>
          <Route path="/login">
          <Login/>
         </Route>
         <Route path="/checkout">
            <Checkout/>
          </Route>
          <Route path="/thanks">
            <Thanks/>
          </Route>
          <Route path="/">
          <Products/>
          </Route>
          </Switch>
          {/* </BrowserRouter> */}
          {/* </ThemeProvider> */}
    </div>
  );
}

export default App;
