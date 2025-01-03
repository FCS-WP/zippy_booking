import React, { useCallback, useEffect, useState } from "react";
import TableView from "../TableView";
import TablePaginationCustom from "../TablePagination";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import { Api } from "../../api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ListProductsBooking = ({ mappingData, updateListMapping }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loadingState, setLoadingState] = useState({
    global: true,
    rows: {},
  });

  const fetchData = () => {
    setLoadingState((prev) => ({ ...prev, global: true }));
    const formattedData = mappingData.map((item) => {
      return {
        ID: item.items_id,
        Name: item.item_name,
        Type: item.mapping_type,
      };
    });

    setData(formattedData);
    setLoadingState((prev) => ({ ...prev, global: false }));
  };

  const columns = ["ID", "Name", "Type", "Actions"];

  const columnWidths = {
    ID: "auto",
    Name: "auto",
    Type: "auto",
    Actions: "10%",
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

  const handleDeleteMappingItem = async (data) => {
    const confirm = await deleteConfirm();
    if (!confirm) {
      return false;
    }
    const deletedData = {
      items_id: data.ID,
      type: data.Type,
    };
    const del = await deleteMappingItems([deletedData]);
    updateListMapping();
  };

  const handleDeleteMappingItems = async (rows) => {
    const confirm = await deleteConfirm();
    if (!confirm) {
      return false;
    }
    const deletedMappingIds = [];
    paginatedData.map((item, index) => {
      rows[index]
        ? deletedMappingIds.push({
            items_id: item.ID,
            type: item.Type,
          })
        : null;
    });
    const del = await deleteMappingItems(deletedMappingIds);
    updateListMapping();
  };

  const deleteConfirm = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    return confirm.isConfirmed;
  };

  const deleteMappingItems = async (ids) => {
    try {
      const params = {
        request: ids,
      };
      const { data } = await Api.deleteMappingItems(params);
      if (!data || data.status != "success") {
        toast.error("Delete failed!");
      } else {
        toast.success("Delete Successfully!");
      }
    } catch (error) {
      toast.error("Delete failed!");
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage, mappingData]);

  return (
    <div>
      <TableView
        cols={columns}
        columnWidths={columnWidths}
        rows={paginatedData.map((row) => ({
          ...row,
          Actions: (
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={(e) => handleDeleteMappingItem(row)}
            >
              Delete
            </Button>
          ),
        }))}
        onDeleteRows={handleDeleteMappingItems}
      />
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

export default ListProductsBooking;
