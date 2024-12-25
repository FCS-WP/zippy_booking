export const convertDateTime = (date, time) => {
    let formattedDate = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
    let formattedTime = time;
    console.log(formattedTime);
}

function generateTimeSlots(startTime, endTime, gapTime) {
    const timeSlots = [];

    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (current < end) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current);
        slotEnd.setMinutes(slotEnd.getMinutes() + gapTime);
        if (slotEnd > end) break;

        timeSlots.push({
            start: slotStart.toTimeString().slice(0, 5),
            end: slotEnd.toTimeString().slice(0, 5)
        });

        current.setMinutes(current.getMinutes() + gapTime);
    }

    return timeSlots;
}
