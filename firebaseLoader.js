import { getDocs, collection } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";
import { calendar } from "./app.js";

/**
 * Carrega os eventos do Firebase para o calendário informado e para o usuário especificado.
 * A estrutura de dados é:
 *   <calendarName> (coleção)
 *     └── <userId> (documento)
 *           └── events (subcoleção)
 *
 * @param {string} calendarName - Nome da coleção do calendário (ex.: "Calendário Luca").
 * @param {Object} user - O usuário logado (firebaseAuth.currentUser).
 */
export async function loadFirebaseEvents(calendarName, user) {
  try {
    // Define a referência à subcoleção "events" do usuário dentro da coleção do calendário
    const eventsColRef = collection(db, calendarName, user.uid, "events");
    // Busca todos os documentos dessa subcoleção
    const snapshot = await getDocs(eventsColRef);

    // Remove todos os eventos atuais do FullCalendar
    calendar.getEvents().forEach(event => event.remove());

    // Itera sobre cada documento e adiciona o evento ao FullCalendar
    snapshot.forEach(docSnap => {
      const eventData = docSnap.data();
      // Se desejar, use o ID do documento para o evento:
      eventData.id = docSnap.id;
      calendar.addEvent(eventData);
    });
  } catch (error) {
    console.error("Erro ao carregar eventos do Firebase:", error);
  }
}
