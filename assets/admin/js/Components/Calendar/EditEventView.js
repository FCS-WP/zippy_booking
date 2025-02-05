import { Box, Button, Collapse, Container, DialogActions, DialogTitle, Grid2, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import theme from "../../../theme/theme";
import ProductSearch from "./ProductSearch";
import TimePicker from "../DatePicker/TimePicker";
import { parseTime } from "../../utils/dateHelper";
import DatePicker from "react-datepicker";
import CustomSelectTime from "./CustomSelectTime";
import { toast } from "react-toastify";
import { getEventColors, isValidEmail } from "../../utils/bookingHelper";
import { format } from "date-fns";
import { Bookings } from "../../api/bookings";

const EditEventView = ({ scheduler }) => {
  const event = scheduler.edited;
  const [state, setState] = useState({
    title: 'Testing title',
    description: 'Test Desc'
  });
  const [bookingEmail, setBookingEmail] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedProduct, setSelectedProduct] = useState();
  const [showCollapse, setShowCollapse] = useState(false);
  const [slot, setSlot] = useState({
    from: null,
    to: null
  });

  const handleTimeChange = (time, type) => {
    setSlot({
      ...slot,
      [type]: time
    });
  }

  const prepareData = () => {
    const checkEmail = isValidEmail(bookingEmail);
    if (!checkEmail) {
      toast.error("Invalid Email");
      return null;
    }

    if (!slot.from || !slot.to) {
      toast.error("Missing booking time!");
      return null;
    }
    let bookingStartDate = new Date(scheduler.state.start.value);
    let bookingEndDate = new Date(bookingStartDate);

    if (slot.from > slot.to) {
      toast.error("Booking end time must be greater than booking start time.");
      return null;
    }
  
    const data = {
      product_id: selectedProduct.item_id,
      email: bookingEmail,
      booking_start_date: format(bookingStartDate, "yyyy-MM-dd"),
      booking_end_date: format(bookingEndDate, "yyyy-MM-dd"),
      booking_start_time: format(slot.from, "HH:mm"),
      booking_end_time: format(slot.to, "HH:mm"),
    }

    return data;
  }

  const handleSubmit = async () => {
    const bookingData = prepareData();
    if (!bookingData) {
      return false;
    }

    const {data: response} = await Bookings.createBooking(bookingData);
    if (response.status != 'success') {
      toast.error("Booking Failed!");
      return false;
    }
    const booking = response.data;
    try {
      scheduler.loading(true);
      /**Simulate remote data saving */
      const added_updated_event = (await new Promise((res) => {
        setTimeout(() => {
          res({
            event_id: event?.event_id || Math.random(),
            title: `Booking ${booking.booking_id}`,
            start: new Date(
              `${booking.booking_start_date} ${booking.booking_start_time}`
            ),
            end: new Date(
              `${booking.booking_end_date} ${booking.booking_end_time}`
            ),
            description: state.description,
            booking_data: booking,
            draggable: false,
            color: getEventColors(booking.booking_status),
          });
        }, 2000);
      }));
      scheduler.onConfirm(added_updated_event, event ? "edit" : "create");
      scheduler.close();
    } catch (error) {
      toast.error(error);
    } finally {
      scheduler.loading(false);
      toast.success("Add booking successfully!");
    }
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowCollapse(true);
  }

  return (
    <Box px={3} overflow={'visible'} className="event-dialog">
      <Box>
        <h2>Add new booking</h2>
        <ProductSearch onSelectProduct={handleSelectProduct} />
      </Box>
      {/* Select Time */}
      <Collapse in={showCollapse} sx={{ mb: 3 }}>
      <Box my={2}>
          <Typography mb={'16px'} variant="h5" fontWeight={600} fontSize={'14px'}>Selected Product: </Typography>
          <Box mb={3} className="box-product-info">
            <Typography variant="h6">Product name: {selectedProduct?.item_name}</Typography>
            <Typography variant="h6">Product price: ${selectedProduct?.item_price}</Typography>
          </Box>
        </Box>
      <Grid2 container spacing={3}>
        <Grid2 size={12}>
          <Typography mb={'16px'} variant="h5" fontWeight={600} fontSize={'14px'}>Booking Email: </Typography>
          <TextField 
            fullWidth
            value={bookingEmail}
            onChange={(e)=>setBookingEmail(e.target.value)}
            label="Email"
            variant="outlined"
            placeholder="Enter booking email"
          />
          </Grid2>
        <Grid2 size={6}>
          <Typography variant="h6" fontSize={'14px'} mb={'10px'} fontWeight={600}>From: {selectedProduct?.name}</Typography>
          <CustomSelectTime onChangeTime={handleTimeChange} type={'from'} duration={duration} />
        </Grid2>
        <Grid2 size={6}>
          <Typography variant="h6" fontSize={'14px'} mb={'10px'} fontWeight={600}>To: {selectedProduct?.name}</Typography>
          <CustomSelectTime onChangeTime={handleTimeChange} type={'to'} duration={duration} />
        </Grid2>
      </Grid2>
      </Collapse>
      <DialogActions mb={3} sx={{ p: 0 }}>
        <Button variant="outlined" size="large" onClick={scheduler.close}>Cancel</Button>
        <Button variant="contained" size="large" color="primary" onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Box>
  );
};

export default EditEventView;
