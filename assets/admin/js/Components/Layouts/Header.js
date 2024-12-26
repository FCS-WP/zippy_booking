import React from "react";

const Header = ({ title, ...props }) => {
  return (
    <div className="booking-page-title">
      <h1>{title}</h1>
    </div>
  );
};
export default Header;
