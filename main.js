// Importa os módulos essenciais
import "./auth.js";
import "./login.js";
import "./loginOverlay.js";
import "./carregamento.js";
import "./app.js";
import "./eventos.js";
import "./firebaseEvents.js";

// Importa as funções e objetos que precisamos para carregar os eventos
import { firebaseAuth } from "./auth.js";
import { loadFirebaseEvents } from "./firebaseLoader.js";

// Quando o estado de autenticação mudar, carregamos os eventos do Firebase
firebaseAuth.onAuthStateChanged(user => {
  if (user) {
    // Obtém o elemento do dropdown do calendário
    const calendarSelect = document.getElementById("calendarSelect");
    // Carrega os eventos do calendário inicialmente selecionado
    loadFirebaseEvents(calendarSelect.value, user);
    
    // Adiciona um listener para o dropdown: quando o usuário muda a opção, recarrega os eventos
    calendarSelect.addEventListener("change", (e) => {
      const selectedCalendar = e.target.value;
      loadFirebaseEvents(selectedCalendar, user);
    });
  } else {
    // Se o usuário não estiver autenticado, você pode optar por limpar o calendário ou exibir uma mensagem
    console.log("Usuário não autenticado.");
  }
});
