import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Container,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { webApi } from "../api";
import { getBookingDate, getBookingTime } from "../helper/datetime";
import CustomLoader from "./CustomLoader";
import { toast } from "react-toastify";

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;",
  },
}));

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const adminData = window.admin_data ? window.admin_data : null;

  const getProductsCat = async () => {
    setIsLoading(true);
    const spCategories = await webApi.getSupportCategories();
    const response = spCategories.data;

    if (response.data.categories.length == 0) {
      toast.error("No data: Categories.");
    }

    const cats = [...response.data.categories];
    if (cats.length == 0) {
      toast.error("No data: Categories.");
      setIsLoading(false);
      return 0;
    }

    let dataProducts = [];

    cats.map((category) => {
      if (category.subcategories.length > 0) {
        category.subcategories.map((subCategory) => {
            dataProducts = [...dataProducts, ...subCategory.subcategory_products];
        });
      } else {
        dataProducts = [...dataProducts, ...category.products_in_category];
        }
    });
    dataProducts.length > 0 ? setProducts(dataProducts) : toast.error("No data: Products");
    setIsLoading(false);
  };
  
  const getBookingsData = async () => {
    setIsLoading(true);

    if (!adminData) {
      setIsLoading(false);
      return false;
    }

    const dataBookings = await webApi.getBookings({
      email: adminData.user_email,
    });

    if (dataBookings.data.status != "success") {
      setIsLoading(false);
      return false;
    }

    setBookings(dataBookings.data.data.bookings);
    setIsLoading(false);
  };

  useEffect(() => {
    getBookingsData();
    getProductsCat();
  }, []);

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };
  
  const getProductByBooking = (bookingData) => {
    return products.find(item=>item.product_id == parseInt(bookingData.product_id));
  }

  const filteredBookings = bookings.filter((booking) =>
    booking.booking_status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Booking Management
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          sx={{ border: "none" }}
          placeholder="Search bookings by title or status"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <FaSearch style={{ marginRight: 8 }} />,
          }}
        />
      </Box>
      {isLoading ? (
        <CustomLoader />
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
                <Grid item xs={12} sm={6} md={4} key={booking.ID}>
                  <StyledCard onClick={() => handleBookingClick(booking)}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6">
                          {getProductByBooking(booking)?.product_name}
                        </Typography>
                        <Typography variant="h6">
                          $ {getProductByBooking(booking)?.product_price}
                        </Typography>
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        Date: {getBookingDate(booking.booking_start_date)}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        From: {getBookingTime(booking.booking_start_date)} to: {getBookingTime(booking.booking_end_date)}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1.5,
                        }}
                      >
                        <Chip
                          label={booking.booking_status}
                          color={getStatusColor(booking.booking_status)}
                          size="small"
                          sx={{ paddingX: 1.5 }}
                        />
                        <IconButton size="small" color="primary">
                          <FaEye />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
            ))}
          <Dialog
                  open={open}
                  onClose={handleClose}
                  maxWidth="sm"
                  fullWidth
                >
                  {selectedBooking && (
                    <>
                      <DialogTitle>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h6">Booking Details</Typography>
                          <IconButton onClick={handleClose} size="small">
                            <FaTimes />
                          </IconButton>
                        </Box>
                      </DialogTitle>
                      <DialogContent dividers>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 3 }}
                        >
                          <Box>
                            <Typography variant="h5">
                              {getProductByBooking(selectedBooking)?.product_name}
                            </Typography>
                            <Chip
                              label={selectedBooking.booking_status}
                              color={getStatusColor(selectedBooking.booking_status)}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography>Price:</Typography>
                            <Typography variant="h6">$ {getProductByBooking(selectedBooking)?.product_price}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography>Booking Email:</Typography>
                            <Typography variant="h6">{selectedBooking.email}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography>Booking Date:</Typography>
                            <Typography variant="h6">{getBookingDate(selectedBooking.booking_start_date)}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography>Time:</Typography>
                            <Typography variant="h6">
                              From {getBookingTime(selectedBooking.booking_start_date)} to {getBookingTime(selectedBooking.booking_end_date)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleClose}
                          variant="outlined"
                          sx={{
                            m: 1.5,
                            background: "#4A8875",
                            color: "#FFF",
                            ":hover": { background: "#333", color: "#FFF" },
                          }}
                        >
                          Close
                        </Button>
                      </DialogActions>
                    </>
                  )}
                </Dialog>
        </Grid>
      )}
    </Container>
  );
};

export default BookingHistory;
