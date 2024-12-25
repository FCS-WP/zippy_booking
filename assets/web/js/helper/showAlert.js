import Swal from "sweetalert2";

export const showAlert = (status_code) => {
    switch (status_code) {
        case 'success':
            Swal.fire({
                title: "Success",
                text: "Your booking has been created!",
                icon: "success",
                confirmButtonText: "OK"
            })
            break;
        case 'error':
            Swal.fire({
                title: "Error",
                text: "Please try again!",
                confirmButtonColor: '#c70000',
                icon: "error",
                confirmButtonText: "OK"
            })
            break;      
        default:
            break;
    }
}