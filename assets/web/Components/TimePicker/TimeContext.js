import React, { createContext, useContext, useState, useEffect } from "react";


const TimeContext = createContext();


export const TimeProvider = ({ children }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 15 * 60 * 1000));
  const [productId, setProductId] = useState(null);
  const [userId, setUserId] = useState(0);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const btnBooking = document.getElementById("btn_booking");
    if (btnBooking) {
      setProductId(btnBooking.getAttribute("data-id-product"));
      setUserId(btnBooking.getAttribute("data-id-user"));
      setUserEmail(btnBooking.getAttribute("data-user-email"));
    }
  }, []); 

  return (
    <TimeContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        productId,
        userId,
        userEmail,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
};


export const useTimeContext = () => useContext(TimeContext);
