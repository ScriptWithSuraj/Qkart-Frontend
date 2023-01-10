import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack,Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

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

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 * 
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  if(!cartData)
  return;
  const nextCart=cartData.map((i)=>({
    ...i,
    ...productsData.find((product)=>i.productId === product._id),
  }));
  return nextCart;
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  if(!items.length) return 0;
  const total  = items.map((item)=>item.cost*item.qty).reduce((total,n)=>total+n)
  return total;
};

export const getTotalItems=(items=[])=>
{
  if(!items.length)
  return 0;
  const total=items.map((item)=>item.qty).reduce((total,n)=>total+n);
  return total;
}



/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
}) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

/**
 * Component to display the Cart view
 * 
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 * 
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 * 
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly,
}) => {
 const history = useHistory();
 const token=localStorage.getItem("token");
 const gotoCheckOut=()=>
{ 
  // console.log("go to check out")
  history.push("/checkout")
}

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        { items.map ((item)=>(
        <Box key={item.productId}>
          { item.qty>0 ?
          (
          <Box display="flex" alignItems="flex-start" padding="1rem">
            <Box className="image-container">
              <img src={item.image}
              alt={item.name}
              width="100%"
              height="100%"
              />
            </Box>
            <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="6rem"
        paddingX="1rem">
          <div>{item.name}</div>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
        > { !isReadOnly ?(<Box><ItemQuantity
        handleAdd={ async()=>{
          await handleQuantity(token,items,products,item.productId,item.qty+1);
        }}
        handleDelete={async()=>{
          await handleQuantity(token,items,products,item.productId,item.qty-1);
        }}
        value={item.qty}
        /></Box>):null}
       { isReadOnly ? ( <Box padding="0.5 rem" fontWeight="700" >
         Qty:{item.qty}
        </Box>
       ):null
}
        <Box padding="0.5 rem" fontWeight="700" >
        ${item.cost}
        </Box>
        </Box>
          </Box>
          </Box>
          ):null
          } </Box>))
        }
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(items)}
          </Box>
        </Box>

       { !isReadOnly ?(<Box display="flex" justifyContent="flex-end" className="cart-footer">
          {
          <Button
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            className="checkout-btn"
            onClick={gotoCheckOut}
          >
            Checkout
          </Button>
}
        </Box>):null}
      </Box>
      {
        isReadOnly && ( 
          <Box className="cart">
          {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
          <Box>
              <Box
          display="flex"
          flexDirection="column"
           justifyContent="space-between"
          height="10rem"
           paddingX="1rem"
          paddingY="1rem">
          <Box  fontWeight="800" >
           Order Details
          </Box>
          <Box display="flex" justifyContent="space-between" >
          <Typography color="#3C3C3C" variant="p">
          Products
            </Typography>
           <Typography>{getTotalItems(items)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" >
          <Typography  variant="p">
          Subtotal
            </Typography>
           <Typography>${getTotalCartValue(items)}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" >
          <Typography  variant="p">
          Shipping Charges
            </Typography>
           <Typography>${0}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" >
          <Typography  variant="h6">
          Total
            </Typography>
           <Typography>${getTotalCartValue(items)}</Typography>
          </Box>
          </Box>
            </Box>
            </Box>
        )
      }
    </>
  );
};

export default Cart;
