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
  const [priceProduct, setPriceProduct] = useState("0");
  const [priceExtraTime, setExtraTime] = useState("0");
  const [statusExtraTime, setStatusExtraTime] = useState(false);
  const [startExtraTime, setStartExtraTime] = useState("");
  const [endExtraTime, setEndExtraTime] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [ConfirmPasswordRegister, setConfirmPasswordRegister] = useState("");

  const [open, setOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const [isBookingVisible, setIsBookingVisible] = useState(false);

  const btnBooking = document.getElementById("btn_booking");
  const productid = btnBooking?.dataset.idProduct;

  const getDayOfWeek = (date) => {
    const daysOfWeek = ["0", "1", "2", "3", "4", "5", "6"];
    return daysOfWeek[date.getDay()];
  };

  const handleOpen = () => {
    
    if(admin_data.userID == 0){
      setOpenLogin(true);
    }else{
      setOpen(true);
    }
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let usernameValue = username;
    let passwordValue = password;

    // Prepare sign in parameters
    const params = {
      username: usernameValue,
      password: passwordValue,
    };
    
    const response = await webApi.signIn(params);

    window.admin_data.userID = response.data.data.data.ID;
    window.admin_data.user_email = response.data.data.data.email;
    
    if(response.data.status == "success"){
      showAlert(
        "success",
        "Login Success",
        "Continute booking"
      );
      setOpen(true);
      setOpenLogin(false);
      
    }else{
      showAlert(
        "warning",
        "Login Fails",
        "Wrong username or password"
      );
    }
    return;
  };

  const handleOpenRegister = async (e) =>{
    e.preventDefault();
    setOpen(false);
    setOpenLogin(false);
    setOpenRegister(true);

  };

  const handleRegister = async (e) =>{
    e.preventDefault();

    let emailRegisterValue = emailRegister;
    let passwordRegisterValue = passwordRegister;
    let ConfirmPasswordRegisterValue = ConfirmPasswordRegister;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRegisterValue)) {
        showAlert(
          "warning",
          "Invalid email",
          "Please enter the correct email format."
        );
        return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordRegisterValue)) {
        showAlert(
          "warning",
          "Invalid password",
          "Password must have at least 8 characters, including letters, numbers and special characters."
        );
        return;
    }

    if (passwordRegisterValue !== ConfirmPasswordRegisterValue) {
        showAlert(
          "warning",
          "Invalid confirm password",
          "Confirm passwords do not match. Please check again."
        );
        return;
    }
    
    // Prepare register parameters
    const params = {
      email: emailRegisterValue,
      password: passwordRegisterValue,
    };

    const response = await webApi.registerAccount(params);

    if(response.data.status == "success"){
      showAlert(
        "success",
        "Register Success",
        "Continute Sign In"
      );
      setOpenRegister(false);
      setOpenLogin(true);
      
    }else{
      showAlert(
        "warning",
        "Register Fails",
        "Please register again"
      );
    }
    return;

  };
  
  const handleClose = () => {
    setOpen(false);
    setOpenLogin(false);
  };

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
    
    setProductId(productid);
  }, []);

  const handleConfirm = (result) => {
    if (result.isConfirmed) {
      window.location.href = "/booking-history";
    } else if (result.isDismissed) {
      handleClose();
    }
  };

  const checkMappingProduct = async () => {

    try {
      const params = {
        product_id: productId,
      };

      const response = await webApi.mappingProduct(params);

      if (response.data.data.booking === true) {
        setIsBookingVisible(true);
      } else {
        setIsBookingVisible(false);
      }
    } catch (error) {
      console.error("Error fetching mapping product:", error);
      setIsBookingVisible(false); 
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
    checkMappingProduct();
  }, [productId]);

  const getAllBooking = async () => {
    try {
      const params = {
        product_id: productId,
        booking_start_date: format(selectedDate, "yyyy-MM-dd"),
        booking_end_date: format(selectedDate, "yyyy-MM-dd"),
      };
      const bookingsResponse = await webApi.getBookings(params);
      setBookings(bookingsResponse.data.data.bookings || []);
      
      const indexDate = parseInt(getDayOfWeek(new Date(format(selectedDate, "yyyy-MM-dd"))));
      const configResponse = await webApi.getConfigs();
      let extraTime = configResponse.data.data.store_working_time;

      if(extraTime[indexDate].extra_time.is_active == 'T'){
        setStatusExtraTime(true);
        const responseMapping = await webApi.mappingProduct(params);
        
        const mappingInfor = responseMapping.data.data;
        if(mappingInfor.sale_price == null){
          setPriceProduct(mappingInfor.regular_price);
        }else{
          setPriceProduct(mappingInfor.sale_price);
        }
        setExtraTime(mappingInfor.extra_price);
        setStartExtraTime(extraTime[indexDate].extra_time.data[0].from);
        setEndExtraTime(extraTime[indexDate].extra_time.data[0].to);

      }else{
        setStatusExtraTime(false);
      }

      
      
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
      {isBookingVisible && (
        <button
          className="booking_popup_form"
          onClick={handleOpen}
        >
          Booking
        </button>
      )}
      <Modal className="zippy-booking-popup" open={openRegister} onClose={handleClose}>
        <Box>
          <div className="booking_login_page">
            <form onSubmit={handleRegister}>
              <h2 className="login100-form-title">
                Register
              </h2>
              <div className="box_input">
                <input
                  type="text"
                  id="emailRegister"
                  name="emailRegister"
                  required
                  value={emailRegister}
                  onChange={(e) => setEmailRegister(e.target.value)}
                  placeholder="Email"
                />
                <input
                  type="password"
                  id="passwordRegister"
                  name="passwordRegister"
                  required
                  value={passwordRegister}
                  onChange={(e) => setPasswordRegister(e.target.value)}
                  placeholder="Password"
                />
                <input
                  type="password"
                  id="ConfirmPasswordRegister"
                  name="ConfirmPasswordRegister"
                  required
                  value={ConfirmPasswordRegister}
                  onChange={(e) => setConfirmPasswordRegister(e.target.value)}
                  placeholder="Confirm Password"
                />
                <div className="button_submit_login">
                  <input type="submit" value="Register Account" />
                </div>
              </div>
              <div className="register_label">
                <span className="register_label_span">
                  You already have an account?
                </span>
                <a href="#" className="register_label_link" onClick={handleOpen}>
                  Sign in now
                </a>
              </div>
            </form>
            {message && <p>{message}</p>}
          </div>
        </Box>
      </Modal>
      <Modal className="zippy-booking-popup" open={openLogin} onClose={handleClose}>
        <Box>
          <div className="booking_login_page">
            <form onSubmit={handleSubmit}>
              <h2 className="login100-form-title">
                Sign In
              </h2>
              <div className="box_input">
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <div className="button_submit_login">
                  <input type="submit" value="Sign In" />
                </div>
              </div>
              <div className="register_label">
                <span className="register_label_span">
                  Don’t have an account?
                </span>
                <a href="#" className="register_label_link" onClick={handleOpenRegister}>
                  Sign up now
                </a>
              </div>
            </form>
            {message && <p>{message}</p>}
          </div>
        </Box>
      </Modal>
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
                    statusExtraTime={statusExtraTime}
                    priceProduct={priceProduct}
                    priceExtraTime={priceExtraTime}
                    startExtraTime={startExtraTime}
                    endExtraTime={endExtraTime}
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
