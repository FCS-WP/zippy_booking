import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {
  filterTimeSlots,
  generateTimeSlots,
  isWorkingDate,
} from "../../helper/datetime";
import { webApi } from "../../api";
import TimeSlots from "./TimeSlots";
import { format } from "date-fns";
import { getBookingsByDate } from "../../helper/booking";
import { toast } from "react-toastify";
import { alertInputEmail } from "../../helper/showAlert";
import CustomLoader from "../CustomLoader";
import Message from "./Message";

const BookingStep2 = ({
  handleNextStep,
  handlePreviousStep,
  selectedProduct,
  configs,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [filteredTimeSlots, setFilteredTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState();
  const [workingDates, setWorkingDates] = useState([]);
  const [createdBookings, setCreatedBookings] = useState([]);
  const [isloading, setIsloading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const adminData = window.admin_data ? window.admin_data : null;

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    getBookings(date);
  };

  const getBookings = async (date = new Date()) => {
    const bookings = await getBookingsByDate(selectedProduct.product_id, date);
    setCreatedBookings(bookings);
  };

  const handleLoadSlots = () => {
    setIsloading(true);
    const newTimeSlots = filterTimeSlots(
      timeSlots,
      selectedDate,
      createdBookings
    );
    setFilteredTimeSlots(newTimeSlots);
    setIsloading(false);
  };

  useEffect(() => {
    if (configs && configs.length > 0) {
      const singleConfig = configs.filter(
        (config, index) => config.booking_type == "single"
      );
      const slots = generateTimeSlots(
        singleConfig[0].open_at,
        singleConfig[0].close_at,
        singleConfig[0].duration
      );
      setWorkingDates(singleConfig[0].weekdays);
      setTimeSlots(slots);
    }
  }, [configs]);

  useEffect(() => {
    getBookings();
  }, []);

  useEffect(() => {
    handleLoadSlots();
  }, [timeSlots, createdBookings, selectedDate]);

  const handleSubmitStep2 = async () => {
    let userEmail = "";
    if (!selectedTimes) {
      toast.warn("Please fill in all the required information.");
      return;
    }
    setIsSubmitLoading(true);
    if (!adminData.user_email) {
      const inputEmail = await alertInputEmail();
      if (!inputEmail) {
        setIsSubmitLoading(false);
        return;
      }
      userEmail = inputEmail;
    }

    let bookingStartDateString =
      format(selectedDate, "yyyy-MM-dd") + "T" + selectedTimes.start;
    let bookingEndDateString =
      format(selectedDate, "yyyy-MM-dd") + "T" + selectedTimes.end;
    const bookingStartDate = new Date(bookingStartDateString);
    const bookingEndDate = new Date(bookingEndDateString);

    const data = {
      product_id: selectedProduct.product_id,
      email: adminData.user_email ?? userEmail,
      booking_start_date: format(bookingStartDate, "yyyy-MM-dd"),
      booking_end_date: format(bookingEndDate, "yyyy-MM-dd"),
      booking_start_time: format(bookingStartDate, "HH:mm"),
      booking_end_time: format(bookingEndDate, "HH:mm"),
    };
    const createBooking = await webApi.createBooking(data);
    if (!createBooking || createBooking.data?.status != "success") {
      toast.error("Booking Failed!");
      setIsSubmitLoading(false);
      return false;
    }
    toast.success("Booking has been created");
    handleNextStep(2, createBooking.data.data);
    setIsSubmitLoading(false);
    return true;
  };

  return (
    <>
      {selectedProduct && (
        <div className="booking-step-2">
          <div className="product-info">
            <div>
              <h4>Field</h4>
              <span> {selectedProduct.product_name}</span>
            </div>
            <div>
              <h4>Price</h4>
              <span> ${selectedProduct.product_price}</span>
            </div>
          </div>
          <div className="booking-section">
            <div className="booking-calendar">
              <h4>Date & Time</h4>
              <div className="date-box">
                <DatePicker
                  minDate={new Date()}
                  selected={selectedDate}
                  filterDate={(date) => isWorkingDate(date, workingDates)}
                  onChange={(date) => handleSelectDate(date)}
                  inline
                />
              </div>
            </div>
            {configs.length > 0 ? (
              <div className="time-slots">
                {isloading ? (
                  <CustomLoader />
                ) : (
                  <>
                    {filteredTimeSlots && (
                      <TimeSlots
                        slots={filteredTimeSlots}
                        onSelectTime={(time) => setSelectedTimes(time)}
                      />
                    )}
                  </>
                )}
              </div>
            ): (
              <div className="time-slots">
                <Message message={"Booking configs not found!"} />
              </div>
            )}
          </div>
          <div className="btn-container">
            <span
              role="button"
              onClick={() => handlePreviousStep()}
              className="prev-step-btn"
            >
              Cancle
            </span>
            {isSubmitLoading ? (
              <CustomLoader />
            ) : (
              <span
                role="button"
                onClick={() => handleSubmitStep2()}
                className="next-step-btn"
                id="next-step-btn"
              >
                Continue
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BookingStep2;
