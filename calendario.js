import { onSnapshot, collection } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";
import { calendar } from "./app.js";

// Seleciona o valor do dropdown de calendário
let selectedCalendar = document.getElementById("calendarSelect").value;
const calendarSelect = document.getElementById("calendarSelect");

calendarSelect.addEventListener("change", (event) => {
  selectedCalendar = event.target.value;
  // Atualiza a interface do FullCalendar:
  filtrarEventosPorCalendario(selectedCalendar);
});

// Função para filtrar eventos salvos (por exemplo, do localStorage)
function filtrarEventosPorCalendario(calendario) {
    // Remove todos os eventos do calendário atual:
    calendar.getEvents().forEach(event => event.remove());
    
    // Carrega os eventos salvos do localStorage e filtra:
    const savedEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
    const eventosFiltrados = savedEvents.filter(event => event.extendedProps.calendar === calendario);
    
    eventosFiltrados.forEach(event => {
      calendar.addEvent(event);
    });
}

// Função para carregar os eventos via Firebase, chamada após o login
export function carregarEventos(user) {
    // Referência à subcoleção de eventos pessoais do usuário
    const personalEventsRef = collection(db, "users", user.uid, "personalEvents");
    // Referência à coleção de eventos compartilhados
    const sharedEventsRef = collection(db, "sharedEvents");

    // Listener para eventos pessoais
    onSnapshot(personalEventsRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                calendar.addEvent(change.doc.data());
            } else if (change.type === "modified") {
                const event = calendar.getEventById(change.doc.id);
                if (event) {
                    event.setProp("title", change.doc.data().title);
                    event.setStart(change.doc.data().start);
                }
            } else if (change.type === "removed") {
                const event = calendar.getEventById(change.doc.id);
                if (event) event.remove();
            }
        });
    });

    // Listener para eventos compartilhados
    onSnapshot(sharedEventsRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                calendar.addEvent(change.doc.data());
            } else if (change.type === "modified") {
                const event = calendar.getEventById(change.doc.id);
                if (event) {
                    event.setProp("title", change.doc.data().title);
                    event.setStart(change.doc.data().start);
                }
            } else if (change.type === "removed") {
                const event = calendar.getEventById(change.doc.id);
                if (event) event.remove();
            }
        });
    });
}

// Função para carregar eventos salvos do localStorage (caso esteja utilizando esse método também)
export function loadEvents() {
    const savedEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
    savedEvents.forEach(event => {
        if (event.extendedProps && event.extendedProps.calendar === selectedCalendar) {
            if (event.extendedProps.recurrence && event.extendedProps.recurrence.type !== "none") {
                generateRecurringEvents(event);
            } else {
                calendar.addEvent(event);
            }
        }
    });
}

// Caso a função generateRecurringEvents esteja definida neste arquivo, mantenha-a aqui
function generateRecurringEvents(baseEvent) {
    // Sua implementação da função de eventos recorrentes
    // (Certifique-se de que essa função também esteja correta e não dependa de variáveis indefinidas)
    const recurrence = baseEvent.extendedProps.recurrence;
    const startDate = new Date(baseEvent.start);
    const endDate = recurrence.endDate ? new Date(recurrence.endDate) : new Date(startDate.getFullYear() + 1, 11, 31);
    let currentDate = new Date(startDate);
    let eventCount = 0;
    while (currentDate <= endDate) {
        let shouldAddEvent = false;
        switch (recurrence.type) {
            case 'daily':
                shouldAddEvent = true;
                break;
            case 'weekly':
                shouldAddEvent = true;
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'weekdays':
                shouldAddEvent = recurrence.days.includes(currentDate.getDay());
                break;
            case 'custom':
                const weekday = currentDate.getDay();
                const weeksSinceStart = Math.floor((currentDate - startDate) / (7 * 24 * 60 * 60 * 1000));
                shouldAddEvent = recurrence.days.includes(weekday) && (weeksSinceStart % parseInt(recurrence.frequency) === 0);
                break;
        }
        if (shouldAddEvent) {
            const recurringEvent = { 
                ...baseEvent, 
                start: new Date(currentDate).toISOString(),
                id: `${baseEvent.id}-${eventCount++}`
            };
            calendar.addEvent(recurringEvent);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
}
