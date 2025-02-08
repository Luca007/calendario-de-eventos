import { onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { firebaseAuth } from "./auth.js"; // ajuste o caminho conforme necessário

// Exemplo de uso:
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    console.log("Usuário autenticado:", user);
    // Carregue os dados, redirecione, etc.
  } else {
    console.log("Usuário não logado");
    // Mostre a tela de login
  }
});

// Função de login:
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    console.log("Usuário logado:", userCredential.user);
  } catch (error) {
    console.error("Erro no login:", error);
    alert(error.message);
  }
}

// Exporte as funções se precisar chamá-las de outros módulos
export { login };
