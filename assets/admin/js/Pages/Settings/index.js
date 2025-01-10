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
import DatePicker from "react-datepicker";

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
  const [extraTimeEnabled, setExtraTimeEnabled] = useState(false);

  const parseTime = (timeString) => {
    if (!timeString) return null;
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const now = new Date();
    now.setHours(hours, minutes, seconds || 0);
    return now;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

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
                    from: daySchedule.open_at || "00:00",
                    to: daySchedule.close_at || "00:00",
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
  const handleExtraTimeToggle = (day, enabled) => {
    setExtraTimeEnabled((prev) => ({
      ...prev,
      [day]: enabled,
    }));
  };

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

  const calculateCloseAt = (openAt, duration) => {
    if (!openAt) return "";
    const openTime = new Date(openAt);
    openTime.setMinutes(openTime.getMinutes() + duration);
    return formatTime(openTime);
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    const formattedValue = value
      ? `${value.getHours().toString().padStart(2, "0")}:${value
          .getMinutes()
          .toString()
          .padStart(2, "0")}:00`
      : "";

    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot, index) => {
                if (index === slotIndex) {
                  if (field === "from") {
                    const newCloseAt = calculateCloseAt(value, duration);
                    return { ...slot, from: formattedValue, to: newCloseAt };
                  } else {
                    return { ...slot, [field]: formattedValue };
                  }
                }
                return slot;
              }),
            }
          : item
      )
    );
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
        open_at: isOpen ? String(openSlot.from) || "" : "",
        close_at: isOpen ? String(openSlot.to) || "" : "",
      };
    });

    const params = {
      booking_type: bookingType,
      duration: duration,
      store_email: storeEmail,
      allow_overlap: allowOverlap ? 1 : 0,
      store_working_time: storeWorkingTime,
    };

    try {
      const response = isConfigExisting
        ? await Api.updateSettings({ id: configId, ...params })
        : await Api.createSettings(params);

      if (response.data.status === "success") {
        toast.success(response.data.message || "Settings saved successfully!");
        if (!isConfigExisting) {
          setConfigId(response.data.data.id);
          setIsConfigExisting(true);
        }
      } else {
        toast.error(response.data.message || "Error saving settings.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom>
            Settings
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box>
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
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
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
                    borderRadius: "4px",
                    padding: "5px",
                  }}
                >
                  {Array.from({ length: 36 }, (_, i) => (i + 1) * 5).map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option} minutes
                      </MenuItem>
                    )
                  )}
                </Select>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
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
                        {bookingType === "single" && (
                          <TableCell>Extra Time</TableCell>
                        )}{" "}
                        {/* Conditionally add "Extra Time" column */}
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedule.map((item, dayIndex) => (
                        <React.Fragment key={dayIndex}>
                          {item.slots.length === 0 && (
                            <TableRow>
                              <TableCell>{item.day}</TableCell>
                              <TableCell width={"30%"}></TableCell>
                              <TableCell width={"30%"}></TableCell>
                              {bookingType === "single" && (
                                <TableCell></TableCell>
                              )}{" "}
                              {/* Empty cell for "Extra Time" */}
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
                              <TableCell>{item.day}</TableCell>
                              <TableCell width={"30%"}>
                                <Box sx={{ width: "200px" }}>
                                  <DatePicker
                                    selected={parseTime(slot.from)}
                                    onChange={(time) =>
                                      handleTimeChange(
                                        item.day,
                                        slotIndex,
                                        "from",
                                        time
                                      )
                                    }
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeCaption="From"
                                    dateFormat="HH:mm"
                                    timeIntervals={duration}
                                    isClearable
                                    placeholderText="Pick a time"
                                  />
                                </Box>
                              </TableCell>
                              <TableCell width={"30%"}>
                                <Box sx={{ width: "200px" }}>
                                  <DatePicker
                                    selected={parseTime(slot.to)}
                                    onChange={(time) =>
                                      handleTimeChange(
                                        item.day,
                                        slotIndex,
                                        "to",
                                        time
                                      )
                                    }
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeCaption="To"
                                    dateFormat="HH:mm"
                                    timeIntervals={duration}
                                    isClearable
                                    placeholderText="Pick a time"
                                  />
                                </Box>
                              </TableCell>
                              {bookingType === "single" && (
                                <TableCell>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={
                                          extraTimeEnabled[item.day] || false
                                        }
                                        onChange={(e) =>
                                          handleExtraTimeToggle(
                                            item.day,
                                            e.target.checked
                                          )
                                        }
                                      />
                                    }
                                  />
                                </TableCell>
                              )}
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
        </Box>
      )}
      <ToastContainer />
    </Box>
  );
};

export default Settings;
