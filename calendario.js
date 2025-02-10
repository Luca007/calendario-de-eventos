import { loadAllEventsFromCalendar } from "./firebaseLoader.js";

// Seleciona o dropdown de calendário e obtém seu valor atual
let selectedCalendar = document.getElementById("calendarSelect").value;
const calendarSelect = document.getElementById("calendarSelect");

// Quando o usuário muda o calendário, recarrega os eventos do Firebase para o calendário selecionado
calendarSelect.addEventListener("change", (event) => {
  selectedCalendar = event.target.value;
  loadAllEventsFromCalendar(selectedCalendar);
});

// (Opcional) Função para alterar o calendário externamente, se necessário
export function changeCalendar(calendario) {
  selectedCalendar = calendario;
  loadAllEventsFromCalendar(calendario);
}
