import React from "react";
import { Select, MenuItem, CircularProgress } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";

const StatusSelect = ({ currentStatus, onStatusChange, isLoading }) => {
  const handleChange = (event) => {
    const newStatus = event.target.value;
    onStatusChange(newStatus);
  };

  return (
    <FormControl sx={{ m: 1, width: "100%", position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", position: "relative" }}>
        <Select
          value={currentStatus}
          onChange={handleChange}
          size="small"
          disabled={isLoading}
          sx={{
            flexGrow: 1,
            backgroundColor: isLoading ? "rgba(255, 255, 255, 0.7)" : "inherit",
          }}
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
