import Swal from "sweetalert2";

export const showAlert = (status, title, text, timer = 2000) => {
    Swal.fire({
        title: title,
        text: text,
        icon: status,
        confirmButtonText: "OK",
        timer: timer
    })
}