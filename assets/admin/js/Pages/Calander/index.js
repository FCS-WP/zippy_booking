import { Stack } from "immutable";
import React, { useState, useEffect } from "react";
import Header from "../../Components/Layouts/Header";
import { Scheduler } from "@aldabil/react-scheduler";
const Calander = () => {
  const title = "Bookings Canlander";

  return (
    <>
      <Header title={title}></Header>
      <Scheduler
        view="month"
        events={[
          {
            event_id: 1,
            title: "Event 1",
            start: new Date("2021/5/2 09:30"),
            end: new Date("2021/5/2 10:30"),
          },
          {
            event_id: 2,
            title: "Event 2",
            start: new Date("2021/5/4 10:00"),
            end: new Date("2021/5/4 11:00"),
          },
        ]}
      />
    </>
  );
};

export default Calander;
