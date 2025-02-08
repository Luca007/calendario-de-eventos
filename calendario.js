function carregarEventos(user) {
    // Referência à subcoleção de eventos pessoais do usuário
    const personalEventsRef = collection(db, "users", user.uid, "personalEvents");
    // Referência à coleção de eventos compartilhados
    const sharedEventsRef = collection(db, "sharedEvents");

    // Listener para eventos pessoais (para atualizações em tempo real)
    onSnapshot(personalEventsRef, (snapshot) => {
    snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
        // Adicione o evento ao seu calendário
        calendar.addEvent(change.doc.data());
        } else if (change.type === "modified") {
        // Atualize o evento no calendário
        const event = calendar.getEventById(change.doc.id);
        if (event) {
            event.setProp("title", change.doc.data().title);
            event.setStart(change.doc.data().start);
            // Atualize outras propriedades conforme necessário
        }
        } else if (change.type === "removed") {
        // Remova o evento do calendário
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
