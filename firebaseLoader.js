import { onSnapshot, collection } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from "./auth.js";
import { calendar } from "./app.js";

export function loadAllEventsFromCalendar(calendarName) {
  console.log("Carregando eventos para o calendário:", calendarName);
  // Limpa todos os eventos atuais do FullCalendar
  calendar.getEvents().forEach(event => event.remove());
  
  const eventsRef = collection(db, calendarName, "shared", "events");
  onSnapshot(eventsRef, snapshot => {
    snapshot.docChanges().forEach(change => {
      const eventData = change.doc.data();
      eventData.id = change.doc.id;
      if (change.type === "added") {
        // Verifica se o evento já existe – se existir, atualiza
        const existingEvent = calendar.getEventById(change.doc.id);
        if (existingEvent) {
          existingEvent.setProp("title", eventData.title);
          existingEvent.setStart(eventData.start);
          existingEvent.setExtendedProp("rawTitle", eventData.extendedProps.rawTitle);
          existingEvent.setExtendedProp("description", eventData.description);
          existingEvent.setExtendedProp("completed", eventData.extendedProps.completed);
          existingEvent.setExtendedProp("recurrence", eventData.extendedProps.recurrence);
          existingEvent.setExtendedProp("icon", eventData.extendedProps.icon);
          existingEvent.setExtendedProp("emoji", eventData.extendedProps.emoji);
          existingEvent.setExtendedProp("calendar", eventData.extendedProps.calendar);
          existingEvent.setExtendedProp("createdBy", eventData.extendedProps.createdBy);
          existingEvent.setExtendedProp("taskPoints", eventData.extendedProps.taskPoints);
        } else {
          calendar.addEvent(eventData);
        }
      } else if (change.type === "modified") {
        const ev = calendar.getEventById(change.doc.id);
        if (ev) {
          ev.setProp("title", eventData.title);
          ev.setStart(eventData.start);
          ev.setExtendedProp("rawTitle", eventData.extendedProps.rawTitle);
          ev.setExtendedProp("description", eventData.description);
          ev.setExtendedProp("completed", eventData.extendedProps.completed);
          ev.setExtendedProp("recurrence", eventData.extendedProps.recurrence);
          ev.setExtendedProp("icon", eventData.extendedProps.icon);
          ev.setExtendedProp("emoji", eventData.extendedProps.emoji);
          ev.setExtendedProp("calendar", eventData.extendedProps.calendar);
          ev.setExtendedProp("createdBy", eventData.extendedProps.createdBy);
          ev.setExtendedProp("taskPoints", eventData.extendedProps.taskPoints);
        }
      } else if (change.type === "removed") {
        const ev = calendar.getEventById(change.doc.id);
        if (ev) ev.remove();
      }
    });
  });
}
