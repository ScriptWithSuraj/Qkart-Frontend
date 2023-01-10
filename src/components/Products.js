import { TroubleshootTwoTone } from "@mui/icons-material";
import { Search, SentimentDissatisfied } from "@mui/icons-material";
import { alertTitleClasses } from "@mui/material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Button,
  Typography,
  Card,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart from "./Cart";
import {generateCartItemsFrom} from "./Cart"

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

const Products = () => {
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   *
   *
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  const [debounce, updateDebounce] = useState("");
  const [prod, updateProd] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [filterProd, setFilterProducts] = useState([]);
  const [noProd, updateNoProd] = useState(false);
  const [isLogin, updateIsLogin] = useState(false);
  const [items,setItems]=useState([])   // Cart Items
  const token=localStorage.getItem("token"); //user login token;

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
     //////////////////////////////////////// fetchingCart //////////////////////////////////////////

  const fetchCart=async (token)=>
  { 
    try{
      const res=await axios.get(`${config.endpoint}/cart`,{headers:{
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
    }
    catch(err){
      enqueueSnackbar("Error while fetching the cart",{variant:"error"})
      return null;
    }
  }    

  ////////////////////////////////////////// Add To Cart function /////////////////////////////////////////////

  async function addToCart(
    token,items,products,productId,qty,options={preventDuplicate : false}
  )
  {
    if(!token)
    {
      enqueueSnackbar("Please login to add to cart", {
        variant: "warning",
      });
      return;
    }
    if(options.preventDuplicate && items.find(item=>item.productId===productId))
    {
      enqueueSnackbar("item already in cart, use the sidebar to update the cart", {
        variant: "warning",
      });
      return;
    }
    try{
      const res=await axios.post(`${config.endpoint}/cart`,{productId,qty},{headers:{
        Authorization: `Bearer ${token}`,
      },
    })
      updateCartItems(res.data,products);
    }
    catch(err){
      enqueueSnackbar("Error adding to cart",{variant:"error"})
    }
    return true;
  }  
                     ////////////////////////////// update cart Items ///////////////

  const updateCartItems=(cartData,products)=>
  { 
    const cartItems =generateCartItemsFrom(cartData,products);
    setItems(cartItems);
  }
 ////////////////////////////////////////////////////////// Perform Searcj///////////////////////////////////////
  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilterProducts(response.data);
      return response.data;
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setFilterProducts([]);
          updateNoProd(true);
        }
        if (err.response.status === 500) {
          enqueueSnackbar(err.response.data.meesage, {
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
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const searchValue = event.target.value;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeOut = setTimeout(() => {
      performSearch(searchValue);
    }, 500);
    updateDebounce(timeOut);
  };

  // {

  const [circular, updateCircular] = useState(false);
  // const  = async () => {};
  const performAPICall = async () => {
    try {
      updateCircular(true);
      if (localStorage.getItem("token") != null) {
        updateIsLogin(true);
      }
      let productData = await axios.get(`${config.endpoint}/products`);
      if (productData.data.length > 0) {
        updateProd(productData.data);
        setFilterProducts(productData.data);
      }
      updateCircular(false);
      return productData.data;
    } catch (err) {
      updateCircular(false);
      if (err.responose && err.response.status === 500) {
        enqueueSnackbar(err.response.data.message, {
          variant: "error",
        });
        return null;
      } else {
        // alert('error')
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
        return null;
      }
    }
  };
  useEffect(() => {
    const onLoadHandle = async () => {
      const productFromAPI = await performAPICall();
      if(localStorage.getItem("token") != null)
      {
      const cartData= await fetchCart(token);
      const cartDetails= await generateCartItemsFrom(cartData,productFromAPI)  // mergin poduct data and the cart data.
      setItems(cartDetails);
      }
    };
    onLoadHandle();
  }, []);

  // console.log(prod);
  return (
    <div>
      {/*for desktop*/}
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          style={{ width: 411 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounce)}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounce)}
      />

      <Grid container>
        <Grid
          item
          xs={12}
          md={isLogin && prod.length ? 9 : 12}
          className="product-grid"
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {circular ?
          (
            <Box 
             className="loading"
            >
              <CircularProgress />
              <Typography gutterBottom variant="h6" component="div">
                Loading Products
              </Typography>
            </Box>
        ) : (
            <Grid container spacing={2} >
              {/* Filter Produnct from search bar */}
              {filterProd.length > 0 && !noProd ? (
                filterProd.map((fp) => (
                  <Grid item md={3} xs={6} key={fp._id}>
                    <ProductCard product={{ ...fp }}
                     handleAddToCart={ async ()=>{
                      await addToCart(token,items,prod,fp._id,1,{preventDuplicate:true,});
                    }} />
                  </Grid>
                  // no products found //
                ))
              ) : filterProd.length === 0 && noProd ? (
                  <Box
                   className="loading"
                  >
                    <SentimentDissatisfied></SentimentDissatisfied>
                    <Typography gutterBottom variant="h6" component="div">
                      No products found
                    </Typography>
                  </Box>
              ) : null
              // (
              //   // prod.map((p) => (
              //   //   <Grid item md={3} xs={6} key={p._id}>
              //   //     <ProductCard product={{ ...p }} handleAddToCart={ async ()=>{
              //   //       await addToCart(token,items,prod,p._id,1,{preventDuplicate:true,});
              //   //     }} />
              //   //   </Grid>
              //   // ))
              //   null;
              // )
              }
            </Grid>
          )}
        </Grid>
        {isLogin ? (
          <Grid container item xs={12} md={3} bgcolor="#E9F5E1">
            <Cart
            hasCheckoutButton
            products={prod}
            items={items}
            handleQuantity={addToCart}
            />
          </Grid>
        ) : null}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
