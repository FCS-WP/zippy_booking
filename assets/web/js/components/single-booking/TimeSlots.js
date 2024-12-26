import React, { useState } from 'react'

const TimeSlots = ({slots = [], onSelectTime}) => {
    const [timeActive, setTimeActive] = useState(); 
    const handleTimeSelect = (time, index) => {
        setTimeActive(index);
        onSelectTime(time);
    }
  return (
    <div>
        <h4>Time Slots</h4>
        <div className="slots-container">
            {slots && slots.map((slot, index) => (
                <div 
                key={index} 
                role="button" 
                onClick={()=>handleTimeSelect(slot, index)} 
                className={`slot-item ${timeActive == index ? 'active' : ''}`}
                >
                    <span>{slot.start} - {slot.end}</span>
                </div>
            ))}
            {slots.length == 0 && (
                <div>
                    The date you selected is fully booked. Please choose another date.
                </div>
            )}
        </div>
    </div>
  )
}

export default TimeSlots