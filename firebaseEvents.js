import { collection, addDoc, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";

/**
 * Salva ou atualiza um evento no Firebase.
 * @param {Object} eventConfig - Objeto com os dados do evento.
 * @param {Object} user - O usuário logado (firebaseAuth.currentUser).
 * @param {string} calendarName - Nome do calendário selecionado (ex.: "Calendário Ludica").
 * @returns {Promise<string>} - O ID do documento salvo.
 */
export async function salvarEventoFirebase(eventConfig, user, calendarName) {
  try {
    // Define a referência à subcoleção "events" dentro do documento do usuário, na coleção do calendário.
    const eventsCollection = collection(db, calendarName, user.uid, "events");
    if (!eventConfig.id || eventConfig.id === "") {
      // Cria um novo evento
      const docRef = await addDoc(eventsCollection, eventConfig);
      console.log("Evento salvo com ID:", docRef.id);
      return docRef.id;
    } else {
      // Atualiza um evento existente
      const eventDoc = doc(db, calendarName, user.uid, "events", eventConfig.id);
      await setDoc(eventDoc, eventConfig, { merge: true });
      console.log("Evento atualizado:", eventConfig.id);
      return eventConfig.id;
    }
  } catch (error) {
    console.error("Erro ao salvar evento no Firebase:", error);
    throw error;
  }
}

/**
 * Apaga um evento do Firebase.
 * @param {string} eventId - O ID do evento a ser apagado.
 * @param {Object} user - O usuário logado.
 * @param {string} calendarName - Nome do calendário em que o evento está salvo.
 */
export async function apagarEventoFirebase(eventId, user, calendarName) {
  try {
    const eventDoc = doc(db, calendarName, user.uid, "events", eventId);
    await deleteDoc(eventDoc);
    console.log("Evento apagado:", eventId);
  } catch (error) {
    console.error("Erro ao apagar evento no Firebase:", error);
    throw error;
  }
}
