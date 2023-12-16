import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import { styled } from "@mui/material/styles";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import '../myOrders.css'
const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditOrder = (orderId,idofOrder) => {
    return (
      <Link to={`/add-order/${orderId}?idofOrder=${idofOrder}`}>
        <Button variant="outlined" color="primary">
          Edit
        </Button>
      </Link>
    );
  };

  const handleAddOrder = () => {
    return (
      <Link to="/add-order">
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: "10px" }}
        >
          Add New Order
        </Button>
      </Link>
    );
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Order deleted succesfully");
        fetchOrders();
      } else {
        console.error("Error deleting order");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const formatDateFromServer = (date) => {
    const dateObject = new Date(date);
    const formattedDate = dateObject.toISOString().split("T")[0];
    return formattedDate;
  };

  return (
    <div className="main-container">
      <h1>My Orders</h1>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Order #</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell># Products</StyledTableCell>
              <StyledTableCell>Final Price</StyledTableCell>
              <StyledTableCell align="right">Options</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <StyledTableRow key={order.order_id}>
                <StyledTableCell>{order.order_id}</StyledTableCell>
                <StyledTableCell>{order.order_number}</StyledTableCell>
                <StyledTableCell>
                  {formatDateFromServer(order.date)}
                </StyledTableCell>
                <StyledTableCell>{order.num_products}</StyledTableCell>
                <StyledTableCell>{order.final_price}</StyledTableCell>
                <StyledTableCell align="right">
                  {handleEditOrder(order.order_number)}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteOrder(order.order_number,order.order_id)}
                  >
                    Delete
                  </Button>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {handleAddOrder()}
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
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));



export default MyOrders;
