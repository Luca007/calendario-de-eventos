import { addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";

// Função para salvar um evento pessoal
export async function salvarEventoPessoal(eventConfig, user) {
    try {
    // Se for um novo evento, use addDoc; se já tiver um ID, use setDoc com merge
    if (!eventConfig.id) {
        // Crie um novo documento na subcoleção "personalEvents"
        const docRef = await addDoc(collection(db, "users", user.uid, "personalEvents"), eventConfig);
        console.log("Evento pessoal adicionado com ID:", docRef.id);
    } else {
        // Atualize um evento existente
        await setDoc(doc(db, "users", user.uid, "personalEvents", eventConfig.id), eventConfig, { merge: true });
        console.log("Evento pessoal atualizado");
    }
    } catch (error) {
    console.error("Erro ao salvar o evento pessoal:", error);
    }
}

// Função para salvar um evento compartilhado
export async function salvarEventoCompartilhado(eventConfig) {
    try {
    if (!eventConfig.id) {
        const docRef = await addDoc(collection(db, "sharedEvents"), eventConfig);
        console.log("Evento compartilhado adicionado com ID:", docRef.id);
    } else {
        await setDoc(doc(db, "sharedEvents", eventConfig.id), eventConfig, { merge: true });
        console.log("Evento compartilhado atualizado");
    }
    } catch (error) {
    console.error("Erro ao salvar o evento compartilhado:", error);
    }
}
