import { collection, addDoc, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";

/**
 * Salva ou atualiza um evento no Firebase.
 * Os eventos são salvos na estrutura:
 *   <calendarName>/shared/events/<eventoId>
 * @param {Object} eventConfig - Dados do evento.
 * @param {Object} user - Usuário logado.
 * @param {string} calendarName - Nome da coleção (ex.: "ludica", "ludy", "luca").
 * @returns {Promise<string>} - O ID do documento salvo.
 */
export async function salvarEventoFirebase(eventConfig, user, calendarName) {
  try {
    const eventsCollection = collection(db, calendarName, "shared", "events");
    if (!eventConfig.id || eventConfig.id === "") {
      const newId = user.uid + "-" + Date.now().toString();
      eventConfig.id = newId;
      const docRef = await addDoc(eventsCollection, eventConfig);
      console.log("Evento salvo com ID:", docRef.id);
      return docRef.id;
    } else {
      const eventDoc = doc(db, calendarName, "shared", "events", eventConfig.id);
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
 * @param {string} eventId - ID do evento.
 * @param {Object} user - Usuário logado (não usado para construir o caminho).
 * @param {string} calendarName - Nome da coleção.
 */
export async function apagarEventoFirebase(eventId, user, calendarName) {
  try {
    const eventDoc = doc(db, calendarName, "shared", "events", eventId);
    await deleteDoc(eventDoc);
    console.log("Evento apagado:", eventId);
  } catch (error) {
    console.error("Erro ao apagar evento no Firebase:", error);
    throw error;
  }
}
