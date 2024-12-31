import React, { useState } from 'react'
import TableView from '../TableView';
import TablePaginationCustom from '../TablePagination';

const ListProductsBooking = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loadingState, setLoadingState] = useState({
    global: true, 
    rows: {}, 
  });

  const columns = [
    "ID",
    "Name",
    "Type",
    "Status",
    "Actions",
  ];

  const columnWidths = {
    ID: "auto",
    Name: "auto",
    Type: "auto",
    Status: "auto",
    Actions: "auto"
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  return (
    <div>
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
      />
      <TablePaginationCustom
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  )
}

export default ListProductsBooking