import React, { useState, useEffect } from "react";
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
  Switch,
  Select,
  MenuItem,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Api } from "../../api";

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
  const [schedule, setSchedule] = useState(
    daysOfWeek.map((day) => ({ day, slots: [] }))
  );
  const [duration, setDuration] = useState(5); // in minutes
  const [storeEmail, setStoreEmail] = useState("");
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [bookingType, setBookingType] = useState("single");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await Api.getSettings();
        const data = response.data;
        const fetchedSchedule =
          data.schedule || daysOfWeek.map((day) => ({ day, slots: [] }));
        setSchedule(fetchedSchedule);
        setDuration(data.duration || 5);
        setStoreEmail(data.storeEmail || "");
        setAllowOverlap(data.allowOverlap || false);
        setOpenAt(data.openAt || "");
        setCloseAt(data.closeAt || "");
        setBookingType(data.bookingType || "single");
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSchedule(daysOfWeek.map((day) => ({ day, slots: [] })));
      }
    };

    fetchSettings();
  }, []);

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

  const handleSaveChanges = async () => {
    const storeWorkingTime = schedule.map((item) => {
      const isOpen = item.slots.length > 0;
      const openSlot = item.slots[0] || {};
      const closeSlot = item.slots[item.slots.length - 1] || {};

      const weekdayIndex = daysOfWeek.indexOf(item.day);

      return {
        is_open: isOpen ? 1 : 0,
        weekday: weekdayIndex,
        open_at: isOpen ? openSlot.from || "" : null,
        close_at: isOpen ? closeSlot.to || "" : null,
      };
    });

    const params = {
      booking_type: bookingType,
      duration: bookingType === "single" ? duration : null,
      store_email: storeEmail,
      allow_overlap: allowOverlap ? 1 : 0,
      store_working_time: storeWorkingTime,
    };

    try {
      const response = await Api.updateSettings(params);
      console.log(response);
      

      const updatedResponse = await Api.getSettings();
      const updatedData = updatedResponse.data;

      const updatedSchedule =
        updatedData.schedule && updatedData.schedule.length > 0
          ? updatedData.schedule
          : daysOfWeek.map((day) => ({ day, slots: [] }));
      console.log(updatedSchedule.openAt);
      
      setSchedule(updatedSchedule);
      setDuration(updatedData.duration || "5");
      setStoreEmail(updatedData.storeEmail || "");
      setAllowOverlap(updatedData.allowOverlap || false);
      setOpenAt(updatedData.openAt || "");
      setCloseAt(updatedData.closeAt || "");
      setBookingType(updatedData.bookingType || "single");
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const durationOptions = [];
  for (let i = 5; i <= 180; i += 5) {
    durationOptions.push(i);
  }

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box>
            <Box mb={1}>
              <Typography variant="body1">Booking Type</Typography>
              <RadioGroup
                row
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
              >
                <FormControlLabel
                  value="single"
                  control={<Radio />}
                  label="Single"
                />
                <FormControlLabel
                  value="multiple"
                  control={<Radio />}
                  label="Multiple"
                />
              </RadioGroup>
            </Box>
            <Box mb={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allowOverlap}
                    onChange={(e) => setAllowOverlap(e.target.checked)}
                  />
                }
                label="Allow Overlap"
              />
            </Box>
            <Box mb={1}>
              <Typography variant="body1">Duration</Typography>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                }}
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option} minutes
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box mb={1}>
              <Typography variant="body1">Store Email</Typography>
              <TextField
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
          </Box>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
            >
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
                          <IconButton
                            onClick={() => handleAddTimeSlot(item.day)}
                          >
                            <AddCircleOutlineIcon color="primary" />
                          </IconButton>
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
                            <IconButton
                              onClick={() => handleAddTimeSlot(item.day)}
                            >
                              <AddCircleOutlineIcon color="primary" />
                            </IconButton>
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
