import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";

/**
 * Carrega o progresso do usuário do Firebase.
 * @param {string} uid - UID do usuário.
 * @returns {Promise<Object>} - Dados do progresso ou { score: 0, level: 1 } se não existir.
 */
export async function loadUserProgressFirebase(uid) {
  try {
    const docRef = doc(db, "userProgress", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return { score: 0, level: 1 };
    }
  } catch (error) {
    console.error("Erro ao carregar progresso do usuário:", error);
    return { score: 0, level: 1 };
  }
}

/**
 * Atualiza o progresso do usuário no Firebase.
 * @param {string} uid - UID do usuário.
 * @param {Object} progressData - Dados do progresso.
 * @returns {Promise<void>}
 */
export async function updateUserProgressFirebase(uid, progressData) {
  try {
    const docRef = doc(db, "userProgress", uid);
    await setDoc(docRef, progressData, { merge: true });
    console.log("Progresso do usuário atualizado:", uid, progressData);
  } catch (error) {
    console.error("Erro ao atualizar progresso do usuário:", error);
  }
}
