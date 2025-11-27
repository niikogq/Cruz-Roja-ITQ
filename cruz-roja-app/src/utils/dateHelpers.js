export function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = (utc_days + 1) * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  let seconds = total_seconds % 60;
  total_seconds -= seconds;
  let hours = Math.floor(total_seconds / (60 * 60));
  let minutes = Math.floor(total_seconds / 60) % 60;
  date_info.setHours(hours);
  date_info.setMinutes(minutes);
  date_info.setSeconds(seconds);
  return date_info;
}

export function formatDate(serial) {
  if (!serial) return '';
  const date = excelDateToJSDate(serial);
  return date.toLocaleDateString('es-CL');
}
