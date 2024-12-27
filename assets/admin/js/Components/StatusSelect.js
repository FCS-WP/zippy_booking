import React from "react";
import { Select, MenuItem, CircularProgress } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import { amber, yellow,orange,green } from "@mui/material/colors";

const StatusSelect = ({ currentStatus, onStatusChange, isLoading }) => {
  const handleChange = (event) => {
    const newStatus = event.target.value;
    onStatusChange(newStatus);
  };

  const getStatusStyles = (status) => {
    const colors = {
      pending: {
        background:orange[300],
        text: orange[800],
        border: orange[300],
      },
      completed: {
        background: green[300],
        text: green[800],
        border: green[300],
      },
    };

    return (
      colors[status] || {
        background: "inherit",
        text: "inherit",
        border: "inherit",
      }
    );
  };

  const { background, text, border } = getStatusStyles(currentStatus);

  return (
    <FormControl sx={{width: "100%", position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
        <Select
          value={currentStatus}
          onChange={handleChange}
          size="small"
          disabled={isLoading}
          sx={{
            flexGrow: 1,
            backgroundColor: isLoading
              ? "rgba(255, 255, 255, 0.7)"
              : background,
            color: isLoading ? "rgba(0, 0, 0, 0.38)" : text,
            borderColor: border,
            borderWidth: 1,
            borderStyle: "solid",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: border,
            },
            "&.Mui-disabled": {
              color: "rgba(0, 0, 0, 0.38)",
              borderColor: "rgba(0, 0, 0, 0.12)",
            },
          }}
          variant="outlined"
        >
          <MenuItem key={"pending"} value={"pending"}>
            Pending
          </MenuItem>
          <MenuItem key={"completed"} value={"completed"}>
            Completed
          </MenuItem>
        </Select>
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={16} />
          </Box>
        )}
      </Box>
    </FormControl>
  );
};

export default StatusSelect;
