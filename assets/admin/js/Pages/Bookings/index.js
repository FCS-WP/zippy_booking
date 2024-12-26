import React, { useEffect, useCallback, useState } from "react";
import TableView from "../../Components/TableView";
import Header from "../../Components/Layouts/Header";
import { Bookings } from "../../api/bookings";
import { Box } from "@mui/material";
import { formatDate } from "../../utils/dateHelper";
import TablePaginationCustom from "../../Components/TablePagination";
import StatusSelect from "../../Components/StatusSelect";

const Index = () => {
  const pageTitle = "Bookings";
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      const { data: responseData } = await Bookings.getBookings();

      if (responseData.status === "success") {
        const formattedData = responseData.data.bookings.map((booking) => {
          return {
            ID: booking.ID,
            Date:
              formatDate(booking.booking_start_date) +
              " - " +
              formatDate(booking.booking_end_date),
            Customer: booking.email,
            Product: booking.product_id,
            duration: booking.duration,
            Status: (
              <StatusSelect
                currentStatus={booking.booking_status}
                onStatusChange={(newStatus) =>
                  handleStatusChange(booking.ID, newStatus)
                }
                bookingID={booking.ID}
              />
            ),
            "Created Date": formatDate(booking.booking_start_date),
          };
        });

        setData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching bookings data:", error);
    }
  }, []);

  const handleStatusChange = (bookingID, newStatus) => {
    const updatedData = data.map((booking) =>
      booking.ID === bookingID ? { ...booking, Status: newStatus } : booking
    );
    console.log(updatedData);

    setData(updatedData);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    "ID",
    "Date",
    "Customer",
    "Product",
    "Duration",
    "Status",
    "Created Date",
  ];

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div>
      <Header title={pageTitle} />
      <TableView cols={columns} rows={paginatedData} />
      <TablePaginationCustom
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default Index;
