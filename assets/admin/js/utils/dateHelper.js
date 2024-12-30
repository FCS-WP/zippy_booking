export const formatDate = (dateString, format = "MMMM d, yyyy") => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  switch (format) {
    case "MMMM d, yyyy":
      return `${month} ${day}, ${year}`;
    case "MM/dd/yyyy":
      return `${("0" + (date.getMonth() + 1)).slice(-2)}/${("0" + day).slice(
        -2
      )}/${year}`;
    case "yyyy/MM/dd":
      return `${year}/${("0" + (date.getMonth() + 1)).slice(-2)}/${(
        "0" + day
      ).slice(-2)}`;
    default:
      return `${month} ${day}, ${year}`;
  }
};
