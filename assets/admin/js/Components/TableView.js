import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  FormControlLabel,
} from "@mui/material";

const TableView = ({ cols, rows, columnWidths = {} }) => {
  const [selectedRows, setSelectedRows] = useState({});

  useEffect(() => {
    const initialSelection = rows.reduce((acc, _, index) => {
      acc[index] = false;
      return acc;
    }, {});
    setSelectedRows(initialSelection);
  }, [rows]);

  const handleRowCheckboxChange = (rowIndex) => {
    setSelectedRows((prevState) => ({
      ...prevState,
      [rowIndex]: !prevState[rowIndex],
    }));
  };

  const handleMasterCheckboxChange = (event) => {
    const newSelection = rows.reduce((acc, _, index) => {
      acc[index] = event.target.checked;
      return acc;
    }, {});
    setSelectedRows(newSelection);
  };

  const isMasterChecked =
    rows.length > 0 && Object.values(selectedRows).every(Boolean);

  const isMasterIndeterminate =
    !isMasterChecked && Object.values(selectedRows).some((checked) => checked);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f1f1f1" }}>
          <TableRow>
            <TableCell padding="checkbox" style={{ width: "50px" , textAlign: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isMasterChecked}
                    indeterminate={isMasterIndeterminate}
                    onChange={handleMasterCheckboxChange}
                    sx={{ textAlign: "center" }}
                  />
                }
                style={{ marginRight:0, }}
              />
            </TableCell>
            {cols.map((col, index) => (
              <TableCell
                key={index}
                style={{ width: columnWidths[col] || "auto", backgroundColor: "#f1f1f1" }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ backgroundColor: "#fff" }}>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} sx={{ backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "#fff" }}>
              <TableCell padding="checkbox" style={{ textAlign: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedRows[rowIndex] || false}
                      onChange={() => handleRowCheckboxChange(rowIndex)}
                    />
                  }
                  style={{ marginRight:0, }}
                />
              </TableCell>
              {cols.map((col, colIndex) => (
                <TableCell key={colIndex} style={{ width: columnWidths[col] || "auto" }}>
                  {row[col]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableView;
