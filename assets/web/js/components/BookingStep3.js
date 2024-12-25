import React, { useEffect } from 'react'
import Swal from 'sweetalert2'

const BookingStep3 = () => {
    const handleClick = () => {
        Swal.fire({
            title: "Success",
            text: "Your booking has been created!",
            icon: "success",
            confirmButtonText: "Okay"
          }).then((result) => {
            if (result.isConfirmed) {
                console.log('confirmed');
            } else {
                console.log('fail');
            }
          });
    }

    useEffect(()=>{
        handleClick();
    })

  return (
    <div>Thanks for your boooking!
        <button onClick={()=> handleClick()}>Alert</button>
    </div>
  )
}

export default BookingStep3