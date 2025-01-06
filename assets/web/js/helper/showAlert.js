import Swal from "sweetalert2";

export const showAlert = (status, title, text, timer = 0) => {
  Swal.fire({
    title: title,
    text: text,
    icon: status,
    confirmButtonText: "OK",
    timer: timer,
  });
};

export const showAlertMultipleProduct = (
  timer = 0,
  status,
  title,
  text,
  handleConfirm
) => {
  Swal.fire({
    title: title,
    text: text,
    icon: status,
    showCancelButton: true,
    confirmButtonText: "View Booking",
    cancelButtonText: "Cancel",
    timer: timer,
  }).then((result) => {
    handleConfirm(result);
  });
};

export const alertInputEmail = async () => {
  const { value: email } = await Swal.fire({
    title: "EMAIL ADDRESS ",
    input: "email",
    inputPlaceholder: "Enter your email address",
    showCancelButton: true,
    confirmButtonText: "Continue",
    focusConfirm: true,
    customClass: {
      input: "swal-input-email",
      confirmButton: "swal-confirm-btn",
    },
    inputValidator: (email) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email || !regex.test(email)) {
        return "Please enter a valid email address!";
      }
    },
  });
  if (email) {
    return email;
  }
  return null;
};
