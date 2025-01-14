import { format } from "date-fns";
import { webApi } from "../api";

export const getBookingsByDate = async (booking_id, date, status = "pending") => {
  const queryParams = {
    product_id: booking_id,
    booking_start_date: format(date, "yyyy-MM-dd"),
    booking_end_date: format(date, "yyyy-MM-dd"),
    booking_status: status,
  };
  const res = await webApi.getBookings(queryParams);
  if (res.data.data.length == 0) {
    return [];
  }
  return res.data.data.bookings;
};

export const hardDataConfigs = {
  "status": "success",
  "message": "Operation Successful!",
  "data": {
      "store_email": "hau.nguyen@floatingcube.com",
      "default_booking_status": "pending",
      "booking_type": "single",
      "allow_overlap": "T",
      "store_working_time": [
          {
              "id": "1",
              "weekday": "0",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                      {
                          "from": "08:00:00",
                          "to": "1000:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "2",
              "weekday": "1",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "3",
              "weekday": "2",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "4",
              "weekday": "3",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "5",
              "weekday": "4",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "6",
              "weekday": "5",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "02:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          },
          {
              "id": "7",
              "weekday": "6",
              "is_open": "T",
              "open_at": "07:00:00",
              "close_at": "17:00:00",
              "duration": "60",
              "extra_time": {
                  "is_active": "T",
                  "data": [
                      {
                          "from": "17:00:00",
                          "to": "20:00:00"
                      },
                     {
                          "from": "08:00:00",
                          "to": "10:00:00"
                      }
                  ]
              },
              "created_at": "2025-01-13 07:39:41",
              "updated_at": "2025-01-13 07:41:02"
          }
      ],
      "holiday": [
          {
              "label": "New year",
              "date": "01/01/2025"
          },
          {
              "label": "Date 1",
              "date": "02/02/2025"
          }
      ]
  }
}