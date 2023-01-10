import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { createFalse } from "typescript";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */

  const [user, updateUser] = useState("");
  const [pass, updatePass] = useState("");
  const [confirmPass, updateConfirmPass] = useState("");
  const [circular, updateCircular] = useState(false);
  const history=useHistory();
  // let formData = { username: user, password: pass };
  let validateData = {
    username: user,
    password: pass,
    confirmPassword: confirmPass,
  };

  const register = async () => {
    try {
      // console.log(formData)
      let url = `${config.endpoint}/auth/register`;
      updateCircular(true);
      let registerData = await axios.post(url, {username:user,password:pass});
      if (registerData.data.success) {
        enqueueSnackbar("Registered successfully", {
          variant: "success",
        });
        history.push("/login");
      }
      updateCircular(false);
    } catch (err) {
      updateCircular(false);
      if (err.response && err.response.status === 400) {
        // console.log(err.response.data.message)
        
        enqueueSnackbar(err.response.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    if (!data.username || data.username==="") {
      enqueueSnackbar("Username is a required field", {
        variant: "warning",
      });
    }
    else if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
    }
    else if(!data.password || data.password==="")
    {
      enqueueSnackbar("Password is a required field", {
        variant: "warning",
      });
    }
    else if(data.password.length<6)
    {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
    }
    else if(data.password!==data.confirmPassword)
    {
      enqueueSnackbar("Passwords do not match", {
        variant: "warning",
      });
    }
    else{
      register()
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons/>
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={(e) => updateUser(e.target.value)}
            value={user}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={(e) => updatePass(e.target.value)}
            value={pass}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={(e) => {
              updateConfirmPass(e.target.value);
            }}
            value={confirmPass}
          />
          {!circular? <Button
            onClick={() => validateInput(validateData)}
            className="button"
            variant="contained"
          >
            Register Now
          </Button>
          : 
          <Box sx={{ display: 'flex' , alignItems: 'center',flexDirection: 'column'}} >
          <CircularProgress />
          </Box>
        }  
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
