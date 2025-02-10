import { firebaseAuth } from "./auth.js";
import "./login.js";
import "./loginOverlay.js";
import "./carregamento.js";
import "./calendario.js";
import "./app.js";
import "./eventos.js";
import "./firebaseEvents.js";
import "./firebaseLoader.js";
import "./userProgress.js";
import "./icons.js";
import { loadAllEventsFromCalendar } from "./firebaseLoader.js";

firebaseAuth.onAuthStateChanged(user => {
  if (user) {
    const calendarSelect = document.getElementById("calendarSelect");
    loadAllEventsFromCalendar(calendarSelect.value);
    calendarSelect.addEventListener("change", (e) => {
      loadAllEventsFromCalendar(e.target.value);
    });
  } else {
    console.log("Usuário não autenticado.");
  }
});
