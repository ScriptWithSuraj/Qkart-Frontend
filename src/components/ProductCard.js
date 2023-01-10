import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,Grid,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    // <CardActions>
    <Card className="card">
      {/* <Button>ADD TO CART</Button> */}
      <CardMedia
        component="img"
        image={product.image}
        alt="bag"
      />
      <CardContent>
      <Typography gutterBottom variant="h6" component="div">{product.name}</Typography>
      <Typography gutterBottom variant="h5" component="div">${product.cost}</Typography>
      <Rating name="size-small" value={product.rating}  precision={0.5} readOnly/>
      </CardContent>
      <Button onClick={handleAddToCart}>ADD TO CART</Button>
    </Card>
    // </CardActions>
  );
};

export default ProductCard;
