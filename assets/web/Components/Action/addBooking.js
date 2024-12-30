import React, { useEffect, useState } from "react";
import { useDateContext } from '../Booking/DateContext';
import { useTimeContext } from "../TimePicker/TimeContext";
import { webApi } from "../../js/api";
import { alertInputEmail, showAlert } from "../../js/helper/showAlert";

function BookingButton() {
    const { selectedDate } = useDateContext(); 
    const { startDate = new Date(), endDate = new Date() } = useTimeContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { productId, userId, userEmail } = useTimeContext();

    const formatDate = (date) => date.toISOString().split('T')[0]; 

    const getAddDataFunction = async () => {
        // Prepare the start and end date parameters
        const formattedDate = formatDate(selectedDate);
        const startDateParam = `${formattedDate} ${startDate.toLocaleTimeString()}`;
        const endDateParam = `${formattedDate} ${endDate.toLocaleTimeString()}`;
        console.log(startDate);
        console.log(endDate);
        try {
            setLoading(true);
            setError(null);

            let email = userEmail;
            if (!email) {
                email = await alertInputEmail();
                if (!email) {
                    showAlert("warning", "Canceled", "You did not enter a valid email or canceled the booking.");
                    return;
                }
            }

            const params = {
                product_id: productId,
                user_id: userId,
                email,
                booking_start_date: startDateParam,
                booking_end_date: endDateParam,
            };

            // const newBookings = await webApi.createBooking(params); 

            showAlert("success", "Booking Successful", "Your booking has been created successfully!");
            console.log("Booking created with params:", params);

        } catch (err) {
            setError(err.message || "An unknown error occurred.");
            showAlert("error", "Booking Failed", err.message || "An unknown error occurred.");
        } finally {
            setLoading(false); 
        }
    };

    const handleClick = () => {
        getAddDataFunction();
    };

    return (
        <div>
            <button onClick={handleClick} disabled={loading}>
                {loading ? "Loading..." : "Continue"}
            </button>
        </div>
    );
}

export default BookingButton;
