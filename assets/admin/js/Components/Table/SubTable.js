import {
  Box,
  Checkbox,
  Fade,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomTableRow from "./CustomTableRow";
import TablePaginationCustom from "../TablePagination";
import { Api } from "../../api";
import { toast } from "react-toastify";
import AdminLoader from "../AdminLoader";

const SubTableHeader = (props) => {
  const { cols, onChangeMasterCheckbox } = props;
  const [isMasterChecked, setIsMasterChecked] = useState(false);
  const [isMasterIndeterminate, setIsMasterIndeterminate] = useState(false);

  const handleChangeMasterCheckbox = () => {
    setIsMasterChecked(!isMasterChecked);
    onChangeMasterCheckbox();
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding="checkbox"
          style={{ width: "50px", textAlign: "center" }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isMasterChecked}
                indeterminate={isMasterIndeterminate}
                onChange={handleChangeMasterCheckbox}
                sx={{ textAlign: "center" }}
              />
            }
            style={{ marginRight: 0 }}
          />
        </TableCell>
        {cols &&
          cols.map((col, index) => (
            <TableCell
              key={index}
              style={{
                width: "auto",
              }}
            >
              {col}
            </TableCell>
          ))}
      </TableRow>
    </TableHead>
  );
};

const SubTableBody = (props) => {
  const { rows, cols, onChangeData } = props;
  const columnWidths = [];
  const [selectedRows, setSelectedRows] = useState([]);
  const handleRowCheckboxChange = (rowIndex) => {
    setSelectedRows((prevState) => ({
      ...prevState,
      [rowIndex]: !prevState[rowIndex],
    }));
  };

  return (
    <TableBody sx={{ backgroundColor: "#fff" }}>
      {rows &&
        rows.map((row, rowIndex) => (
          <CustomTableRow
            hover={true}
            key={rowIndex}
            row={row}
            cols={cols}
            columnWidths={columnWidths}
            selectedRows={selectedRows}
            rowIndex={rowIndex}
            onChangeList={onChangeData}
            onChangeCheckbox={handleRowCheckboxChange}
          />
        ))}
    </TableBody>
  );
};

const SubTable = (props) => {
  const { cols, category, onChangeData } = props;
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const onChangeMasterCheckbox = () => {
    console.log("Check all checkbox");
  };
  
  const closeLoading = async () => {
    setTimeout(()=>{
        setIsLoading(false);
    }, 1000);
  }

  const getProductsInCategory = async () => {
    setIsLoading(true);
    const params = {
      category_id: category.ID,
    };

    const { data: response } = await Api.getProductsByCategory(params);

    if (response.status !== "success") {
      toast.error("Failed to get products!");
      closeLoading();
      return false;
    }

    if (response.data.length == 0) {
      toast.error("No product found!.");
      closeLoading();
      return false;
    }

    const products = parseProducts(response.data);
    const formattedData = products.map((item) => {
      return {
        ID: item.product_id,
        Name: item.product_name,
        Type: "product",
        "Regular Price": item.product_price,
        "Extra Price": item.extra_price,
      };
    });
    closeLoading();
    setData(formattedData);
    return true;
  };

  const parseProducts = (res) => {
    const dataCategories = res.categories[0];
    let products = [];
    if (dataCategories.subcategories) {
      dataCategories.subcategories.map((item) => {
        products = [...products, ...item.products];
      });
    }
    products = [...products, ...dataCategories.products_in_category];
    return products;
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    getProductsInCategory();
  }, []);

  return (
    <Box sx={{ width: "100%", position: 'relative' }}>
      {isLoading ? (
        <AdminLoader />
      ) : (
        <Fade in={true} unmountOnExit >
            <Paper variant="outlined" sx={{ p: 3, pb: 1 }}>
            <Stack>
                <Typography fontWeight={"600"}>
                Products in {category.Name}
                </Typography>
            </Stack>
            <TableContainer>
                <Table>
                <SubTableHeader
                    onChangeMasterCheckbox={onChangeMasterCheckbox}
                    cols={cols}
                />
                <SubTableBody
                    rows={paginatedData}
                    cols={cols}
                    onChangeData={onChangeData}
                />
                </Table>
                <TablePaginationCustom
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                />
            </TableContainer>
            </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default SubTable;
