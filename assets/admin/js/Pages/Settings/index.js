import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Settings = () => {
  const [timeFormat, setTimeFormat] = useState("12-hour");
  const [schedule, setSchedule] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );

  const handleAddTimeSlot = (day) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? { ...item, slots: [...item.slots, { from: "", to: "" }] }
          : item
      )
    );
  };

  const handleRemoveTimeSlot = (day, slotIndex) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.filter((_, index) => index !== slotIndex),
            }
          : item
      )
    );
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot, index) =>
                index === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : item
      )
    );
  };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box mb={3}>
            <Typography variant="body1" gutterBottom>
              Time Format
            </Typography>
            <RadioGroup
              row
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
            >
              <FormControlLabel
                value="12-hour"
                control={<Radio />}
                label="12-hour (e.g. 01:00 PM)"
              />
              <FormControlLabel
                value="24-hour"
                control={<Radio />}
                label="24-hour (e.g. 13:00)"
              />
            </RadioGroup>
          </Box>
          <Box>
            <TextField
              label="Average Spent Time (minutes)"
              type="number"
              defaultValue={60}
              size="small"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Max Pax No."
              type="number"
              defaultValue={10}
              size="small"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Booking ID Prefix"
              size="small"
              fullWidth
              margin="normal"
            />
          </Box>
          <Box mt={2}>
            <Button variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((item, dayIndex) => (
                  <React.Fragment key={dayIndex}>
                    {item.slots.length === 0 && (
                      <TableRow>
                        <TableCell>{item.day}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell>
                          <Button
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => handleAddTimeSlot(item.day)}
                          >
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                    {item.slots.map((slot, slotIndex) => (
                      <TableRow key={slotIndex}>
                        {slotIndex === 0 && (
                          <TableCell rowSpan={item.slots.length || 1}>
                            {item.day}
                          </TableCell>
                        )}
                        <TableCell>
                          <TextField
                            type="time"
                            size="small"
                            value={slot.from}
                            onChange={(e) =>
                              handleTimeChange(
                                item.day,
                                slotIndex,
                                "from",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="time"
                            size="small"
                            value={slot.to}
                            onChange={(e) =>
                              handleTimeChange(
                                item.day,
                                slotIndex,
                                "to",
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() =>
                              handleRemoveTimeSlot(item.day, slotIndex)
                            }
                          >
                            <RemoveCircleOutlineIcon color="error" />
                          </IconButton>
                          {slotIndex === item.slots.length - 1 && (
                            <Button
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={() => handleAddTimeSlot(item.day)}
                            >
                              Add Time Slot
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
