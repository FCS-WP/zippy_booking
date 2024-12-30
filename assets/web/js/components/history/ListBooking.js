import React, { useState, useEffect, useRef } from "react";
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
  Pagination,
  Stack,
} from "@mui/material";
import { styled } from "@mui/system";
import { FaSearch, FaEye, FaTimes } from "react-icons/fa";

import { toast } from "react-toastify";
import { webApi } from "../../api";
import CustomLoader from "../CustomLoader";
import { getBookingDate, getBookingTime } from "../../helper/datetime";

const StyledCard = styled(Card)(({ theme }) => ({
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow:
        "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;",
    },
  }));

const ListBooking = () => {
  const adminData = window.admin_data ? window.admin_data : null;
  const [bookings, setBookings] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isShowPagination, setIsShowPagination] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const BOOKINGS_PER_PAGE = 9;
  const pageFocusRef = useRef(null);

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
    dataProducts.length > 0
      ? setProducts(dataProducts)
      : toast.error("No data: Products");

    setTimeout(()=>{
      setIsLoading(false);
    }, [1500])
  };

  const getBookingsData = async () => {
    if (!adminData.user_email) {
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
    handleFilterBooking(dataBookings.data.data.bookings);
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBooking(null);
  };

  const getProductByBooking = (bookingData) => {
    return products.find(
      (item) => item.product_id == parseInt(bookingData.product_id)
    );
  };

  const handleFilterBooking = (data) => {
    const filtered = data.filter((booking) =>
      booking.booking_status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBookings(filtered);
    const getTotalPage = Math.ceil(filtered.length / BOOKINGS_PER_PAGE);
    setTotalPage(getTotalPage);
    setDefaultPagination(filtered);

    if (getTotalPage <= 1) {
      setIsShowPagination(false);
      return;
    }

    setTotalPage(getTotalPage);
    setIsShowPagination(true);
  };

  const setDefaultPagination = (data) => {
    page != 1 ? setPage(1) : null;
    const showBookings = data.slice(0, BOOKINGS_PER_PAGE);
    setCurrentBookings(showBookings);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    const startIndex = (value - 1) * BOOKINGS_PER_PAGE;
    const showBookings = filteredBookings.slice(
      startIndex,
      startIndex + BOOKINGS_PER_PAGE
    );
    setCurrentBookings(showBookings);
  };

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

  useEffect(() => {
    getBookingsData();
    getProductsCat();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      handleFilterBooking(bookings);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (pageFocusRef.current) {
      pageFocusRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom ref={pageFocusRef}>
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
          {currentBookings.length != 0 ? (
            currentBookings.map((booking, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={booking.ID}
              >
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
                      From: {getBookingTime(booking.booking_start_date)} to:{" "}
                      {getBookingTime(booking.booking_end_date)}
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
            ))
          ) : (
            <Container>
              <Typography color={"error"} variant="h6">
                No bookings found.
              </Typography>
            </Container>
          )}
          <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
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
                      <Typography variant="h6">
                        $ {getProductByBooking(selectedBooking)?.product_price}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Booking Email:</Typography>
                      <Typography variant="h6">
                        {selectedBooking.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Booking Date:</Typography>
                      <Typography variant="h6">
                        {getBookingDate(selectedBooking.booking_start_date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography>Time:</Typography>
                      <Typography variant="h6">
                        From{" "}
                        {getBookingTime(selectedBooking.booking_start_date)} to{" "}
                        {getBookingTime(selectedBooking.booking_end_date)}
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
      {isShowPagination && (
        <Stack
          direction={"row"}
          sx={{ justifyContent: "center", alignItems: "center", py: 4 }}
        >
          <Pagination
            count={totalPage}
            page={page}
            onChange={handleChangePage}
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Container>
  );
};

export default ListBooking;