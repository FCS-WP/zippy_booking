import React from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { Container } from "@mui/material";
 
const ViewCalendar = () => {
  const CustomView = ({event, close}) => {
    console.log("Event", event);
    return (
      <Container>Custom viewwwwww</Container>
    )
  }

  const CustomWeekCell = (props) => {
    console.log("props", props);
    return (
      <Container>Custom Cell</Container>
    )
  }

  const CustomDayHours = (string) => {
    console.log("props", props);
    return (
      <Container>Custom Cell</Container>
    )
  }


  return (
    <div className="custom-calendar custom-mui">
      <Scheduler
        view="month"
        events={[
          {
            event_id: 1,
            title: "Event 1",
            start: new Date("2025/1/25 09:00"),
            end: new Date("2025/1/25 10:30"),
            color: "#3c5900",
            draggable: false
          },
          {
            event_id: 15,
            title: "Event 15",
            start: new Date("2025/1/25 09:00"),
            end: new Date("2025/1/25 10:00"),
            draggable: false
          },
          {
            event_id: 155,
            title: "Event 155",
            start: new Date("2025/1/25 09:00"),
            end: new Date("2025/1/25 10:00"),
            draggable: false
          },
          {
            event_id: 16,
            title: "Event 15",
            start: new Date("2025/1/25 09:00"),
            end: new Date("2025/1/25 10:00"),
            draggable: false
          },
          {
            event_id: 1565,
            title: "Event 155",
            start: new Date("2025/1/25 09:00"),
            end: new Date("2025/1/25 10:00"),
            draggable: false
          },
          {
            event_id: 2,
            title: "Event 2",
            start: new Date("2025/1/25 10:00"),
            end: new Date("2025/1/25 11:00"),
            draggable: false
          },
          {
            event_id: 3,
            title: "Event 3",
            start: new Date("2025/1/25 13:00"),
            end: new Date("2025/1/25 14:00"),
            draggable: false
          },
          {
            event_id: 4,
            title: "Event 4",
            start: new Date("2025/1/26 10:00"),
            end: new Date("2025/1/26 11:00"),
            draggable: false
          },
        ]}
        customViewer={(event, close)=>
          <CustomView event={event} close={close} />
        }
        week= {{ 
          weekDays: [0, 1, 2, 3, 4, 5], 
          weekStartOn: 6, 
          startHour: 0, 
          endHour: 24,
          step: 60,
          cellRenderer:(props) => <CustomWeekCell />,
          navigation: true,
          disableGoToDay: false
          }}
          day={{
            startHour: 0, 
            endHour: 24, 
            step: 60,
            // cellRenderer?:(props: CellProps) => JSX.Element,
            hourRenderer:(hour) => JSX.Element,
            navigation: true
            }}
      />
    </div>
  );
};

export default ViewCalendar;
