import React, { useEffect, useCallback, useState } from "react";
import TableView from "../../Components/TableView";
import Header from "../../Components/Layouts/Header";
import { Bookings } from "../../api/bookings";
import { formatDate } from "../../utils/dateHelper";
import TablePaginationCustom from "../../Components/TablePagination";
import StatusSelect from "../../Components/StatusSelect";
import CircularProgress from "@mui/material/CircularProgress";
import { toast, ToastContainer } from "react-toastify";
import Box from "@mui/material/Box";
import BookingFilter from "../../Components/BookingFilter";
import { isInFilterDates } from "../../../../web/js/helper/datetime";

const Index = () => {
  const pageTitle = "Bookings";
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDates, setFilterDates] = useState(null);
  const [filterStatus, setFilterStatus] = useState('')

  const [loadingState, setLoadingState] = useState({
    global: true,
    rows: {},
  });

  const fetchData = useCallback(async (page, rowsPerPage) => {
    try {
      setLoadingState((prev) => ({ ...prev, global: true }));
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
            Product: booking.product.name,
            duration: booking.duration,
            Status: booking.booking_status,
            "Created Date": formatDate(booking.booking_start_date),
          };
        });

        setData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching bookings data:", error);
    } finally {
      setLoadingState((prev) => ({ ...prev, global: false }));
    }
  }, []);

  const updateBookingStatus = async (bookingID, newStatus) => {
    try {
      setLoadingState((prev) => ({
        ...prev,
        rows: { ...prev.rows, [bookingID]: true },
      }));

      const params = { booking_id: bookingID, booking_status: newStatus };
      const response = await Bookings.updateBooking(params);

      if (response.data.status === "success") {
        setData((prevData) =>
          prevData.map((booking) =>
            booking.ID === bookingID
              ? { ...booking, Status: newStatus }
              : booking
          )
        );
        toast.success(`Booking has been updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("This booking cannot be updated");
    } finally {
      setLoadingState((prev) => ({
        ...prev,
        rows: { ...prev.rows, [bookingID]: false },
      }));
    }
  };

  const handleStatusChange = (bookingID, newStatus) => {
    updateBookingStatus(bookingID, newStatus);
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [fetchData, page, rowsPerPage]);

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
  const columnWidths = {
    ID: "auto",
    Date: "auto",
    Customer: "auto",
    Product: "auto",
    duration: "auto",
    Status: "10%",
    "Created Date": "auto",
  };

  const handleDataFilter = (dataFilter) => {
    const byStatus = dataFilter.filter(item=>{
      if (filterStatus == '') {
        return item;
      }
      return item.Status == filterStatus;
    })

    const byQuery = byStatus.filter(item=>{
      if (searchQuery == '') {
        return item;
      }
      return item.Customer.toLowerCase().includes(searchQuery.toLowerCase()) || item.Product.toLowerCase().includes(searchQuery.toLowerCase()) ;
    })

    const byDate = byQuery.filter(item=>{
      if (!filterDates) {
        return item;
      }
      const [stringStartDate, stringEndDate] = item.Date.split(" - ").map(date => date.trim());
      const startDate = new Date(stringStartDate);
      return isInFilterDates(startDate, filterDates[0], filterDates[1]);
    })
    return byDate;
  }

  const filteredData = handleDataFilter(data) ?? [];
  
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loadingState.global) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleFilterDate = (value) => {
    setFilterDates(value);
  }
  const handleFilterStatus = (value) => {
    setFilterStatus(value);
  }
  const handleChangeSearchQuery = (value) => {
    setSearchQuery(value);
  }

  return (
    <div className="custom-mui">
      <Header title={pageTitle} />
      <BookingFilter
        onChangeSearchQuery={handleChangeSearchQuery}
        onChangeFilterDate={handleFilterDate}
        onChangeFilterStatus={handleFilterStatus}
      />
      <TableView
        cols={columns}
        columnWidths={columnWidths}
        rows={paginatedData.map((row) => ({
          ...row,
          Status: (
            <StatusSelect
              currentStatus={row.Status}
              isLoading={!!loadingState.rows[row.ID]}
              onStatusChange={(newStatus) => {
                handleStatusChange(row.ID, newStatus);
              }}
            />
          ),
        }))}
        showBookingFilter={true}
      />
      <TablePaginationCustom
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ToastContainer />
    </div>
  );
};

export default Index;
