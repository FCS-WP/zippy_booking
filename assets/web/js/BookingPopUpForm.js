import React, { useEffect, useState } from "react";
import Timepicker from "./components/popup-booking/timepicker/timepicker";
import Prebooking from "./components/popup-booking/pre-booking/prebooking";
import BookingDatePicker from "./components/BookingDatePicker";
import { webApi } from "./api";
import {
  alertInputEmail,
  showAlert,
  bookingSuccessfully,
} from "./helper/showAlert";
import CustomLoader from "./components/CustomLoader";
import { Modal, Box } from "@mui/material";
import { format } from "date-fns";

function BookingPopUp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [productId, setProductId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [configsDate, setConfigsDate] = useState([new Date()]);
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setConfigsDate(date);
  };

  const handleStartTimeSelect = (time) => {
    setSelectedStartTime(time);
  };

  const handleEndTimeSelect = (time) => {
    setSelectedEndTime(time);
  };

  useEffect(() => {
    const btnBooking = document.getElementById("btn_booking");
    const productid = btnBooking?.dataset.idProduct;
    setProductId(productid);
  }, []);

  const handleConfirm = (result) => {
    if (result.isConfirmed) {
      window.location.href = "/booking-history";
    } else if (result.isDismissed) {
      handleClose();
    }
  };

  const createBooking = async () => {
    setIsLoading(true);

    try {
      // Ensure essential data is available
      if (
        !productId ||
        !selectedDate ||
        !selectedStartTime ||
        !selectedEndTime
      ) {
        showAlert(
          "warning",
          "Missing Data",
          "Please ensure all required booking details are selected."
        );
        return;
      }

      // Get email
      let email = admin_data.user_email;
      if (!email) {
        email = await alertInputEmail();
        if (!email) {
          showAlert(
            "warning",
            "Canceled",
            "You did not enter a valid email or canceled the booking."
          );
          return;
        }
      }

      // Prepare booking parameters
      const params = {
        product_id: productId,
        user_id: admin_data.userID,
        email,
        booking_start_date: format(selectedDate, "yyyy-MM-dd"),
        booking_end_date: format(selectedDate, "yyyy-MM-dd"),
        booking_start_time: format(selectedStartTime, "HH:mm"),
        booking_end_time: format(selectedEndTime, "HH:mm"),
      };

      // Create booking
      const response = await webApi.createBooking(params);

      // Handle response
      if (response.data?.status === "success") {
        bookingSuccessfully(handleConfirm);
      } else {
        showAlert(
          "error",
          "Booking Failed",
          response.data?.message || "An unknown error occurred."
        );
      }
    } catch (err) {
      console.error("Booking Error:", err);
      showAlert(
        "error",
        "Booking Failed",
        err.message || "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getConfig = async () => {
    try {
      const configResponse = await webApi.getConfigs();
      setConfigs(configResponse.data.data || []);
    } catch (err) {
      showAlert(
        "error",
        "Get Config Failed",
        err.message || "An unknown error occurred."
      );
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  const getAllBooking = async () => {
    try {
      const params = {
        product_id: productId,
        booking_start_date: format(selectedDate, "yyyy-MM-dd"),
        booking_end_date: format(selectedDate, "yyyy-MM-dd"),
      };
      const bookingsResponse = await webApi.getBookings(params);
      setBookings(bookingsResponse.data.data.bookings || []);
    } catch (err) {
      showAlert(
        "error",
        "Get Booking Failed",
        err.message || "An unknown error occurred."
      );
    }
  };

  useEffect(() => {
    if (productId && selectedDate) {
      getAllBooking();
    }
  }, [selectedDate, productId]);

  return (
    <>
      <button className="booking_popup_form" onClick={handleOpen}>
        Booking
      </button>

      <Modal className="zippy-booking-popup" open={open} onClose={handleClose}>
        <Box>
          <div className="box_pop_up">
            <div className="box_pop_up--content">
              <h2>Booking Form</h2>
              <p>Select a time for Pottery Painting Session</p>
              <p>
                Do note that the studio fee ($28 per person, collected during
                booking of session as a deposit) excludes the price of chosen
                ceramic piece. The studio fee is inclusive of studio and tools
                usage and pottery processing (firing done by Pottery Please)
              </p>
              <div className="row_booking">
                <div className="col_booking_5">
                  <BookingDatePicker
                    handleSelectDate={handleSelectDate}
                    config={configs}
                  />
                </div>
                <div className="col_booking_5">
                  <Timepicker
                    onStartTimeSelect={handleStartTimeSelect}
                    onEndTimeSelect={handleEndTimeSelect}
                    bookings={bookings}
                    configs={configs}
                    configsDate={configsDate}
                  />
                  <Prebooking bookings={bookings} />
                  {isLoading && <CustomLoader />}
                </div>
              </div>
              <div className="flex-space-between">
                <button className="cancel_popup_button" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  className="continute_popup_button"
                  onClick={() => {
                    createBooking();
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}

export default BookingPopUp;
