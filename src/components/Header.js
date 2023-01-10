import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";


const Header = ({ children, hasHiddenAuthButtons }) => {
  
  const history=useHistory();
  const logout=()=>{
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("balance");
    history.push("/");
    window.location.reload();
  }
  const exploreMore=()=>
  {
    history.push("/")
  }

  const login=()=>
  {
    history.push("/login")
  }
  const register=()=>
  {
    history.push("/register")
  }
  if(hasHiddenAuthButtons)
  {
    return(<Box className="header">
    <Box className="header-title">
      <Link to="/">
        <img src="logo_light.svg" alt="QKart-icon"></img>
        </Link>
    </Box>
    {children}
    <Button
      // className="explore-button"
      startIcon={<ArrowBackIcon />}
      variant="text"
      onClick={exploreMore}
    >
      Back to explore
    </Button>
  </Box>
)
  }
  else{
    return (
      <Box className="header">
        <Box className="header-title">
        <Link to="/">
            <img src="logo_light.svg" alt="QKart-icon"></img>
            </Link>
        </Box>
        {children}
        <Stack direction="row" spacing={1} alignItems="center">
          {
            localStorage.getItem("username") ?(
              <>
              <Avatar
              src="avatar.png"
              alt={localStorage.getItem("username") || "profile"}
              />
              <p>{localStorage.getItem("username")}</p>
              <Button type="primary" onClick={logout}>Logout</Button>
              </>
               ):(<>
               <Button onClick={login}>Login</Button>
               <Button variant="contained" onClick={register}>Register</Button>
               </>)
}
        </Stack>
        {/* <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
        >
          Back to explore
        </Button> */}
      </Box>
    );
  }
};

export default Header;
