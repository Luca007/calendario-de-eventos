import { onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { firebaseAuth } from "./auth.js";

// Seleciona os elementos do overlay e do formulário
const loginOverlay = document.getElementById("loginOverlay");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");

// Função para realizar o login usando Firebase
async function doLogin() {
  const email = loginEmail.value;
  const password = loginPassword.value;
  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    console.log("Usuário logado:", userCredential.user);
    // Se o login for bem-sucedido, o overlay será removido pelo onAuthStateChanged
  } catch (error) {
    console.error("Erro no login:", error);
    alert(error.message);
  }
}

// Adiciona o listener para o botão de login
loginButton.addEventListener("click", (event) => {
  event.preventDefault();
  doLogin();
});

// Monitora o estado de autenticação e exibe ou oculta o overlay
onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    // Usuário autenticado: oculta o overlay e libera o scroll
    loginOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  } else {
    // Usuário não autenticado: exibe o overlay e bloqueia o scroll
    loginOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
});
