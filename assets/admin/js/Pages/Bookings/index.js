import React, { useEffect } from "react";
import TableView from "../../Components/TableView";
import Header from "../../Components/Layouts/Header";

import { Bookings } from "../../api/bookings";

const Index = () => {
  const pageTitle = "Bookings";

  const fetchData = useCallback(async (params) => {
    const { data } = await Bookings.getBookings(params);
  }, []);

  useEffect(() => {
    fetchData();
  }, [third]);

  const columns = [
    "ID",
    "Date",
    "Customer",
    "Product",
    "Duration",
    "Status",
    "Created Date",
  ];
  const data = [
    {
      ID: "1",
      Date: "December 26, 2024 11:00 am",
      Customer: "Shin",
      Product: "Product 01",
      Duration: "2 Hour",
      Status: "2",
      "Created Date": "December 25, 2024 8:32 am",
    },
    {
      ID: "2",
      Date: "December 26, 2024 11:00 am",
      Customer: "Shin",
      Product: "Product 01",
      Duration: "2 Hour",
      Status: "2",
      "Created Date": "December 25, 2024 8:32 am",
    },
    ,
  ];

  return (
    <div>
      <Header title={pageTitle} />
      <TableView cols={columns} rows={data} />
    </div>
  );
};

export default Index;
