import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { firebaseAuth } from "./auth.js";

// Utilize onAuthStateChanged normalmente
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    // Carregue dados ou inicialize a interface
  } else {
    // Ação para usuário não autenticado
  }
});
