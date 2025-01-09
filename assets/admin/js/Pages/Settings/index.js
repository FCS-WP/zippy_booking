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
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { Api } from "../../api";
import { toast, ToastContainer } from "react-toastify";
import Header from "../../Components/Layouts/Header";
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
  const [duration, setDuration] = useState(5);
  const [storeEmail, setStoreEmail] = useState("");
  const [allowOverlap, setAllowOverlap] = useState(false);
  const [bookingType, setBookingType] = useState("single");
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState(null);
  const [isConfigExisting, setIsConfigExisting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await Api.getSettings();
        const data = response.data.data;
        if (
          data &&
          data.store_working_time &&
          data.store_working_time.length > 0
        ) {
          setIsConfigExisting(true);
          setConfigId(data.id);
          const fetchedSchedule = daysOfWeek.map((day, index) => {
            const daySchedule = data.store_working_time.find(
              (time) => parseInt(time.weekday) === index
            );

            if (daySchedule && daySchedule.is_open === "1") {
              return {
                day,
                slots: [
                  {
                    from: daySchedule.open_at || "",
                    to: daySchedule.close_at || "",
                  },
                ],
              };
            } else {
              return { day, slots: [] };
            }
          });

          setSchedule(fetchedSchedule);
          setDuration(Number.parseInt(data.duration) || 5);
          setStoreEmail(data.store_email || "");
          setAllowOverlap(data.allow_overlap === "1");
          setBookingType(data.booking_type || "single");
        } else {
          setIsConfigExisting(false);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setIsConfigExisting(false);
        setSchedule(daysOfWeek.map((day) => ({ day, slots: [] })));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleAddTimeSlot = (day) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day && item.slots.length === 0
          ? { ...item, slots: [{ from: "", to: "" }] }
          : item
      )
    );
  };

  const handleRemoveTimeSlot = (day, slotIndex) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day === day ? { ...item, slots: [] } : item))
    );
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    if (!timeOptions.includes(value)) {
      // Snap to the nearest valid time option if value is out-of-range
      const nearestTime =
        timeOptions.find((option) => option >= value) ||
        timeOptions[timeOptions.length - 1];
      value = nearestTime;
    }

    if (field === "from") {
      // If "From" time is changed, calculate the "To" time based on the duration
      const fromTime = value;
      const fromMinutes = parseTimeToMinutes(fromTime);

      // Calculate "To" time by adding the duration (in minutes)
      const toMinutes = fromMinutes + duration;
      const toTime = formatMinutesToTime(toMinutes);

      // Update the "From" and "To" time
      setSchedule((prev) =>
        prev.map((item) =>
          item.day === day
            ? {
                ...item,
                slots: item.slots.map((slot, index) =>
                  index === slotIndex
                    ? { ...slot, from: fromTime, to: toTime }
                    : slot
                ),
              }
            : item
        )
      );
    } else if (field === "to") {
      // If "To" time is changed manually, update only the "To" field
      setSchedule((prev) =>
        prev.map((item) =>
          item.day === day
            ? {
                ...item,
                slots: item.slots.map((slot, index) =>
                  index === slotIndex ? { ...slot, to: value } : slot
                ),
              }
            : item
        )
      );
    }
  };

  // Utility function to parse time (HH:mm) to minutes
  const parseTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Utility function to format minutes to HH:mm time format
  const formatMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}:00`;
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    const storeWorkingTime = schedule.map((item) => {
      const isOpen = item.slots.length > 0;
      const openSlot = item.slots[0] || {};

      const weekdayIndex = daysOfWeek.indexOf(item.day);

      return {
        is_open: isOpen ? 1 : 0,
        weekday: weekdayIndex,
        open_at: isOpen ? formatTime(openSlot.from) || "" : "",
        close_at: isOpen ? formatTime(openSlot.to) || "" : "",
      };
    });

    const create_params = {
      booking_type: bookingType,
      duration: duration,
      store_email: storeEmail,
      allow_overlap: allowOverlap ? 1 : 0,
      store_working_time: storeWorkingTime,
    };

    const update_params = {
      id: configId,
      booking_type: bookingType,
      duration: duration,
      store_email: storeEmail,
      allow_overlap: allowOverlap ? 1 : 0,
      store_working_time: storeWorkingTime,
    };

    try {
      if (isConfigExisting) {
        // Update existing config
        const response = await Api.updateSettings(update_params);

        if (response.data.status === "success") {
          toast.success(
            response.data.message || "Settings updated successfully!"
          );
        } else {
          toast.error(response.data.message || "Error updating settings.");
        }
      } else {
        // Create new config
        const response = await Api.createSettings(create_params);

        if (response.data.status === "success") {
          const newId = response.data.data.id;
          setConfigId(newId);
          setIsConfigExisting(true);
          toast.success(
            response.data.message || "Settings created successfully!"
          );
        } else {
          toast.error(response.data.message || "Error creating settings.");
        }
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const generateTimeOptions = (duration) => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += duration) {
        const hours = String(h).padStart(2, "0");
        const minutes = String(m).padStart(2, "0");
        options.push(`${hours}:${minutes}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions(duration);
  console.log(duration);

  console.log(timeOptions);

  const durationOptions = [];
  for (let i = 5; i <= 180; i += 5) {
    durationOptions.push(i);
  }
  const title = "Settings";
  return (
    <Box>
      <Header title={title} />

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
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Enable this if you want multiple bookings to overlap.
              </Typography>
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
                  padding: "5px",
                }}
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option} minutes
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Set the duration of each booking session.
              </Typography>
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
              disabled={loading}
              style={{
                borderRadius: "8px",
                padding: "13px 20px",
                textTransform: "none",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : (
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
                              disabled={item.slots.length > 0}
                            >
                              <AddCircleOutlineIcon color="primary" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                      {item.slots.map((slot, slotIndex) => (
                        <TableRow key={slotIndex}>
                          <TableCell>{item.day}</TableCell>
                          <TableCell>
                            <Select
                              value={slot.from}
                              onChange={(e) =>
                                handleTimeChange(
                                  item.day,
                                  slotIndex,
                                  "from",
                                  e.target.value
                                )
                              }
                              fullWidth
                              size="small"
                            >
                              {timeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={slot.to}
                              onChange={(e) =>
                                handleTimeChange(
                                  item.day,
                                  slotIndex,
                                  "to",
                                  e.target.value
                                )
                              }
                              fullWidth
                              size="small"
                            >
                              {timeOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>

                          <TableCell>
                            <IconButton
                              onClick={() =>
                                handleRemoveTimeSlot(item.day, slotIndex)
                              }
                            >
                              <RemoveCircleOutlineIcon color="error" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <ToastContainer />
    </Box>
  );
};

export default Settings;
