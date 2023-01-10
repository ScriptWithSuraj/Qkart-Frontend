import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
  cancel,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) => {
          handleNewAddress({
            ...newAddress,
            value: e.target.value,
          });
        }}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={async () => {
            await addAddress(token, newAddress);
          }}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            cancel({
              ...newAddress,
              isAddinNewAddress: false,
            });
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddinNewAddress: false,
    value: "",
  });

  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 500) {
        enqueueSnackbar(err.response.data.message, {
          variant: "error",
        });
      }
    }
  };

  const fetchCart = async (token) => {
    try {
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      enqueueSnackbar("Error while fetching the cart", { variant: "error" });
      return null;
    }
  };
  ///////////////////////////////////////// get Address //////////////////////////

  const getAddresses = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch(err) {
      if(err.response)
      {
        enqueueSnackbar(
          err.response.data.message,
          { variant: "error" }
        );
        return null;        
      }
      else{
        enqueueSnackbar(
          "Could not fetch addresses. Check that the backen is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
        return null;
      }
    
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewAddress({ value: "", isAddinNewAddress: false });
      setAddresses({ ...addresses, all: response.data });
      // await getAddresses(token);
      return response.data;
    } catch (err) {
      if (err.response) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backen is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };
  
  ///////////////////////////////////////// validateRequest ////////////////////////

  const validateRequest=(items,addresses)=>{
    if(localStorage.getItem("balance")<getTotalCartValue(items))
    {
      enqueueSnackbar(
        "not have enough balance",
        { variant: "warning" }
      );
      return false
    }
    if(!addresses.all.length)
    {
      enqueueSnackbar(
        "Please add an address before proceeding.",
        { variant: "warning" }
      );
      return false;
    }
    if(!addresses.selected.length)
    {
      enqueueSnackbar(
        "Please select one shipping address to proceed.",
        { variant: "warning" }
      );
      return false;
    }

    return true;

  }

  ////////////////////////// Perform Checkout /////////////////

  const perFormCheckout = async (token, items, addrresses) => {
    
    if(!validateRequest(items,addrresses)) return;
    try {
      await axios.post(`${config.endpoint}/cart/checkout`,
      {addressId:addrresses.selected},{
        headers:{
          Authorization:`Bearer ${token}`
        },
      }
      );
      enqueueSnackbar("Order placed successfully", { variant: "success" });
      const newBalance=parseInt(localStorage.getItem("balance"))-getTotalCartValue(items);
      localStorage.setItem("balance",newBalance);
      history.push("/thanks");
      return true;
    } catch (err) {
      if(err.response)
      {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      }
      else
      {
        enqueueSnackbar("Could not place order. Check that the backen is running, reachable and returns valid JSON. ", { variant: "error" });
      }
    }
  };

  /////////////////////////////////////////// Add new Address /////////////////////

  //token={token}
  // newAddress={newAddress}
  // handleNewAddress={setNewAddress}
  // addAddress={addresses}

  //////////////////////////////////////////////// Delete the selected address from checkout page ////////////////////////////////////

  const deletedAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (err) {
      if (err.response) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backen is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  ////////////////////////////////////////////////////////////// CDM /////////////////////////////////

  useEffect( async () => {
    if (token) {
     await getAddresses(token);
    } else {
      enqueueSnackbar("You must be logged in to access checkout page", {
        variant: "info",
      });
      history.push("/");
    }
  }, [token]);

  ////////////////////////////////////////////  CDM //////////////////////

  useEffect(() => {
    const onLoadHandler = async () => {
      const productData = await getProducts();
      const cartData = await fetchCart(token);
      if (productData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productData);
        setItems(cartDetails);
        // await getAddresses(token);
      }
    };
    onLoadHandler();
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              {addresses.all.length ? (
                addresses.all.map((item) => (
                  <Box
                    key={item._id}
                    className={
                      addresses.selected === item._id
                        ? "address-item selected"
                        : "address-item not-selected"
                    }
                    onClick={() =>
                      setAddresses({ ...addresses, selected: item._id })
                    }
                  >
                    <Typography>{item.address}</Typography>
                    <Button
                      startIcon={<Delete />}
                      onClick={async () => {
                        await deletedAddress(token, item._id);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              )}
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
           
            {!newAddress.isAddinNewAddress ? (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress({
                    ...newAddress,
                    isAddinNewAddress: true,
                  });
                }}
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
                cancel={setNewAddress}
              />
            )}
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button startIcon={<CreditCard />} variant="contained"
            onClick={async () => {
             await perFormCheckout(token,items,addresses)
            }}>
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
