import React, { useState } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";

const Content = () => {
  const [startDate, setStartDate] = useState(new Date("2024-12-16"));
  const [endDate, setEndDate] = useState(new Date("2024-12-22"));

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Container fluid className="py-4">
      <header className="d-flex justify-content-end align-items-center">
        <div>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline={false}
            className="form-control" 
          />
        </div>
      </header>
      <Row>
        <DashboardCard title="Total Bookings" value="0" />
        <DashboardCard title="Completed Bookings" value="0" highlight="text-success" />
        <DashboardCard title="Pending Bookings" value="0" highlight="text-warning" />
      </Row>
    </Container>
  );
};

const DashboardCard = ({ title, value, highlight }) => {
  return (
    <Col xs={12} sm={6} md={4} lg={2}>
      <Card className="text-center shadow-sm rounded">
        <Card.Body>
          <Card.Title as="h3" className={highlight || ""}>
            {value}
          </Card.Title>
          <Card.Text>{title}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Content;
