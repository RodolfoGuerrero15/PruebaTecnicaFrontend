import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
  InputLabel,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import { styled } from "@mui/material/styles";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "../addOrder.css";
import { blueGrey, red } from "@mui/material/colors";
const getFormattedDate = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const AddOrder = () => {
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);
  const [numProducts, setNumProducts] = useState(0);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [qty, setQty] = useState(0);
  const [orderDate, setOrderDate] = useState(getFormattedDate());
  const [orderNumber, setOrderNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const handleOrderNumberChange = (event) => {
    setOrderNumber(event.target.value);
  };

  useEffect(() => {
    setOrderDate(getFormattedDate());
  }, []);

  const handleNumProductsChange = React.useCallback(() => {
    const newNumProducts = products.length;
    setNumProducts(newNumProducts);
  }, [products]);

  const handleFinalPriceChange = React.useCallback(() => {
    const newFinalPrice = products.reduce(
      (total, product) => total + product.quantity * product.unit_price,
      0
    );
    setFinalPrice(newFinalPrice);
  }, [products]);

  useEffect(() => {
    handleNumProductsChange();
    handleFinalPriceChange();
  }, [handleNumProductsChange, handleFinalPriceChange]);

  //Get all the products from the current order_number for editing the order so the user can see the current products of his order
  const fetchProductsOfOrder = async () => {
    if (id) {
      try {
        const response = await fetch(`/orders-products/${id}`);
        const data = await response.json();
        console.log(data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    } else {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProductsOfOrder();
  }, [id]);

  //Function to fetch all the available products in the store
  //There are only 3 products: TV,PS5 and PC
  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch("/products");
      const data = await response.json();
      setAvailableProducts(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchAvailableProducts();
  }, []);

  //Functions to open and close the modal for adding new products
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct("");
    setUnitPrice(0);
    setQty(0);
  };

  const editProduct = (productId) => {
    const productToEdit = products.find(
      (product) => product.product_id === productId
    );
    setSelectedProduct(productToEdit.name);
    setUnitPrice(productToEdit.unit_price);
    setQty(productToEdit.quantity);
    setIsEditing(true);
    setEditingProductId(productId);
    openModal();
  };
  //Function to add a new product to the order
  const saveProduct = () => {
    const editedProduct = {
      product_id:
        editingProductId ||
        availableProducts.find((product) => product.name === selectedProduct)
          .product_id,
      name: selectedProduct,
      unit_price: unitPrice,
      quantity: qty,
      total_price: qty * unitPrice,
    };

    if (isEditing) {
      const updatedProducts = products.map((product) =>
        product.product_id === editingProductId ? editedProduct : product
      );
      setProducts(updatedProducts);
    } else {
      const productExists = products.some(objeto => objeto.product_id === editedProduct.product_id);
      if(productExists){
        alert(editedProduct.name + " is already in your order")
      }
      else{
        setProducts([...products, editedProduct]);
      }
      
    }

    handleNumProductsChange();
    handleFinalPriceChange();
    closeModal();
  };

  const removeProduct = async (productId) => {
    const updatedProducts = products.filter(
      (product) => product.product_id !== productId
    );
    setProducts(updatedProducts);
    //Update number of products and final prize
    handleNumProductsChange();
    handleFinalPriceChange();
  };

  const saveOrder = async () => {
    try {
      // First fetch to add the order
      const orderResponse = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: orderNumber,
          date: orderDate,
          num_products: numProducts,
          final_price: finalPrice,
        }),
      });
      const orderData = await orderResponse.json();
      if(orderData.err){
        alert(orderData.err)
        return;
      }
      
      //Second fetch to add the new products of the order
      const productsResponse = await fetch("/orders-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          products,
        }),
      });
      const productsData = await productsResponse.text();

      console.log("Order and products added successfully");
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };
  const updateOrder = async () => {
    try {
      //First fetch to delete the previous products of the order
      const productsResponse = await fetch(`/orders-products/${id}`, {
        method: "DELETE",
      });
      const productsData = await productsResponse.text();
      // Second fetch to update the order
      const bodyFetch2 = {
        order_number: id,
        date: orderDate,
        num_products: numProducts,
        final_price: finalPrice,
      };
      const orderResponse = await fetch("/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyFetch2),
      });
      const orderData = await orderResponse.text();

      //Third fetch to Insert the new products of the order
      const productsResponse2 = await fetch("/orders-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: id,
          products,
        }),
      });
      const productsData2 = await productsResponse2.text();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  return (
    <div className="main-container">
      <h1>{id ? "Edit Order" : "Add Order"}</h1>
      {/* Form to add a new order */}
      <form>
        <TextField
          label="Order #"
          type="text"
          name="orderNumber"
          fullWidth
          margin="normal"
          variant="outlined"
          required
          value={id ? id : orderNumber}
          onChange={handleOrderNumberChange}
          InputProps={{
            readOnly: !!id,
          }}
        />

        <TextField
          label="Date"
          type="date"
          name="orderDate"
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={id}
          value={orderDate}
        />

        <TextField
          label="# Products"
          type="number"
          name="productCount"
          fullWidth
          margin="normal"
          variant="outlined"
          disabled
          value={numProducts}
          onChange={handleNumProductsChange}
        />

        <TextField
          label="Final Price"
          type="number"
          name="finalPrice"
          fullWidth
          margin="normal"
          variant="outlined"
          disabled
          value={finalPrice}
          onChange={handleFinalPriceChange}
        />

        {/* Modal for adding a new product to the order */}
        <Modal open={isModalOpen} onClose={closeModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isEditing ? "Edit Product" : "Add New Product"}
            </Typography>
            {/* Form to add a new product */}

            <InputLabel id="product-label">Product Name</InputLabel>
            <Select
              labelId="product-label"
              id="product-select"
              value={selectedProduct}
              onChange={(e) => {
                const selectedProduct = e.target.value;
                setSelectedProduct(selectedProduct);
                const selectedProductInfo = availableProducts.find(
                  (product) => product.name === selectedProduct
                );
                setUnitPrice(
                  selectedProductInfo ? selectedProductInfo.unit_price : 0
                );
              }}
            >
              {availableProducts.map((product) => (
                <MenuItem key={product.name} value={product.name}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Unit Price"
              type="number"
              value={unitPrice}
              disabled
            />

            <TextField
              label="Qty"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: "auto" }}
              onClick={() => {
                saveProduct();
              }}
            >
              Save Product
            </Button>
          </Box>
        </Modal>
        <Link to="/myorders" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (id) {
                updateOrder();
                console.log("Update Order");
              } else {
                if (!orderNumber) {
                  alert("Order # is required");
                } else {
                  saveOrder();
                  console.log("Save and Create Order");
                }
              }
            }}
          >
            {id ? "Save changes" : "Save and Create Order"}
          </Button>
        </Link>
        {/*Table to list all the products of the order */}
        <div className="products">
        <h1>My Products</h1>
        <TableContainer component={Paper} className="table">
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>ID</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Unit Price</StyledTableCell>
                <StyledTableCell>Qty</StyledTableCell>
                <StyledTableCell>Total Price</StyledTableCell>
                <StyledTableCell>Options</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {/* Map all the current products of the order */}
              {products.map((product) => (
                <StyledTableRow key={product.product_id}>
                  <StyledTableCell>{product.product_id}</StyledTableCell>
                  <StyledTableCell>{product.name}</StyledTableCell>
                  <StyledTableCell>{product.unit_price}$</StyledTableCell>
                  <StyledTableCell>{product.quantity}</StyledTableCell>
                  <StyledTableCell>
                    {product.quantity * product.unit_price}$
                  </StyledTableCell>
                  <StyledTableCell>
                    {/* Add product and delete product buttons */}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => editProduct(product.product_id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => removeProduct(product.product_id)}
                    >
                      Remove
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
        <div className="buttons">
        <Button
          variant="outlined"
          color="primary"
          onClick={openModal}
          sx={{
            borderRadius: 50
          }}
        >
          Add New Product
        </Button>

        {/* Button to add the new order */}
        
        </div>
        
      </form>
    </div>
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
export default AddOrder;
