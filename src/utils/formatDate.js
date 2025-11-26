// export function formatDate(date) {
//   const d = new Date(date);

//   return d.toLocaleString("pt-BR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     timeZone: "America/Sao_Paulo",
//   });
// }

export function formatDate(dateInput) {
  if (!dateInput) return "";

  // Se vier Date, converte para ISO sem perder hora
  let dateStr = dateInput instanceof Date
    ? dateInput.toISOString()
    : String(dateInput); // força número ou objeto para string

  // Substitui "T" por espaço
  let clean = dateStr.replace("T", " ");

  // Remove milissegundos, timezone ou segundos extras
  clean = clean.split(".")[0].split("+")[0].split("Z")[0];

  const [datePart, timePartRaw] = clean.split(" ");

  if (!datePart || !timePartRaw) return dateStr; // fallback

  const [year, month, day] = datePart.split("-");

  // Garante apenas HH:MM
  const [hour, minute] = timePartRaw.split(":");

  return `${day}/${month}/${year} às ${hour}:${minute}`;
}