import { firebaseAuth } from "./auth.js";
import { salvarEventoFirebase, apagarEventoFirebase } from "./firebaseEvents.js";
import { loadUserProgressFirebase, updateUserProgressFirebase } from "./userProgress.js";

let calendar;

document.addEventListener('DOMContentLoaded', async function() {
  const calendarEl = document.getElementById('calendar');
  const eventModal = document.getElementById('eventModal');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeModalBtn = document.querySelector('.close');
  const eventForm = document.getElementById('eventForm');
  const deleteEventBtn = document.getElementById('deleteEventBtn');
  const modalTitle = document.getElementById('modalTitle');

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      locale: 'pt-br',
      editable: true,
      events: [],
      dateClick: function(info) {
        openEventModal(info.date);
      },
      eventContent: function(arg) {
        // Utilize a função customEventRender para construir o conteúdo
        // Ela retorna um objeto com a propriedade 'html'
        try {
          let html = "";
          if (arg.event.extendedProps.createdBy) {
            let dotColor = "";
            if (arg.event.extendedProps.createdBy === "TgqY2fwdFuRqtFyqBPXkUaABkbW2") {
              dotColor = "blue";
            } else if (arg.event.extendedProps.createdBy === "1MMo9n9B9Sa02Uz9xJEiGnRkbi92") {
              dotColor = "pink";
            }
            html += `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${dotColor}; margin-right:5px;"></span>`;
          }
          if (arg.event.extendedProps.icon) {
            html += window.getIconHTML(arg.event.extendedProps.icon) + " ";
          }
          const displayTitle = (arg.event.extendedProps.rawTitle || arg.event.title).trim();
          html += displayTitle;
          if (arg.event.extendedProps.emoji) {
            html += " " + arg.event.extendedProps.emoji;
          }
          return { html: html };
        } catch (error) {
          console.error("Erro na customEventRender via eventContent:", error);
          return { html: "" };
        }
      }
    });
    calendar.render();

  const eventStartInput = document.getElementById('eventStart');
  const flatpickrInstance = flatpickr(eventStartInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    locale: "pt",
    time_24hr: true
  });

  if (firebaseAuth.currentUser) {
    const progressData = await loadUserProgressFirebase(firebaseAuth.currentUser.uid);
    document.getElementById('userScore').textContent = progressData.score || 0;
    document.getElementById('userLevel').textContent = progressData.level || 1;
  }

  function openEventModal(date = null, existingEvent = null) {
    eventForm.reset();
    deleteEventBtn.style.display = 'none';
    modalTitle.textContent = 'Adicionar Novo Evento';
    document.getElementById('eventId').value = '';

    recurrenceTypeSelect.value = 'none';
    document.getElementById('customRecurrenceGroup').style.display = 'none';
    document.querySelectorAll('input[name="recurDay"]').forEach(chk => chk.checked = false);
    document.getElementById('recurrenceFrequency').selectedIndex = 0;
    document.getElementById('recurrenceEndDate').value = '';

    if (existingEvent) {
      document.getElementById('eventTitle').value = existingEvent.extendedProps.rawTitle || existingEvent.title;
      document.getElementById('eventStart').value = existingEvent.startStr;
      document.getElementById('eventDescription').value = existingEvent.extendedProps.description || '';
      document.getElementById('eventId').value = existingEvent.id;
      document.getElementById('eventCompleted').checked = existingEvent.extendedProps.completed || false;
      deleteEventBtn.style.display = 'flex';
      modalTitle.textContent = 'Editar Evento';

      if (existingEvent.extendedProps.recurrence) {
        const recurrence = existingEvent.extendedProps.recurrence;
        if (recurrence.type !== 'none') {
          recurrenceTypeSelect.value = recurrence.type;
          if (recurrence.type === 'custom') {
            document.getElementById('customRecurrenceGroup').style.display = 'block';
            if (recurrence.days) {
              recurrence.days.forEach(day => {
                const chk = document.querySelector(`input[name="recurDay"][value="${day}"]`);
                if (chk) chk.checked = true;
              });
            }
            if (recurrence.frequency) {
              document.getElementById('recurrenceFrequency').value = recurrence.frequency;
            }
            if (recurrence.endDate) {
              document.getElementById('recurrenceEndDate').value = recurrence.endDate;
            }
          }
        }
      }
      if (existingEvent.extendedProps.icon) {
        document.getElementById('eventIcon').value = existingEvent.extendedProps.icon;
      }
      if (existingEvent.extendedProps.emoji) {
        document.getElementById('eventEmoji').value = existingEvent.extendedProps.emoji;
      }
      if (existingEvent.extendedProps.taskPoints !== undefined) {
        const pointsInput = document.getElementById('eventPoints');
        if (pointsInput) {
          pointsInput.value = existingEvent.extendedProps.taskPoints;
        }
      }
    } else if (date) {
      flatpickrInstance.setDate(date);
    }
    eventModal.style.display = 'block';
  }

  function closeModal() {
    eventModal.style.display = 'none';
    eventForm.reset();
  }

  addEventBtn.addEventListener('click', () => openEventModal());
  closeModalBtn.addEventListener('click', closeModal);

  const recurrenceTypeSelect = document.getElementById('recurrenceType');
  const customRecurrenceGroup = document.getElementById('customRecurrenceGroup');
  const recurrenceEndDateInput = document.getElementById('recurrenceEndDate');
  const recurrenceEndDatePicker = flatpickr(recurrenceEndDateInput, {
    dateFormat: "Y-m-d",
    locale: "pt",
  });

  recurrenceTypeSelect.addEventListener('change', function() {
    document.querySelectorAll('input[name="recurDay"]').forEach(chk => chk.checked = false);
    document.getElementById('recurrenceFrequency').selectedIndex = 0;
    document.getElementById('recurrenceEndDate').value = '';
    customRecurrenceGroup.style.display = this.value === 'custom' ? 'block' : 'none';
  });

  const emojiInput = document.getElementById('eventEmoji');
  const emojiPicker = document.querySelector('emoji-picker');
  const openEmojiPicker = document.getElementById('openEmojiPicker');
  const clearEmojiBtn = document.getElementById('clearEmoji');

  openEmojiPicker.addEventListener('click', (event) => {
    event.stopPropagation();
    const computedDisplay = window.getComputedStyle(emojiPicker).display;
    emojiPicker.style.display = computedDisplay === 'none' ? 'block' : 'none';
  });
  emojiPicker.addEventListener('click', (event) => {
    event.stopPropagation();
  });
  emojiPicker.addEventListener('emoji-click', event => {
    emojiInput.value += event.detail.unicode;
    emojiPicker.style.display = 'none';
  });
  document.addEventListener('click', (event) => {
    if (!emojiPicker.contains(event.target) && event.target !== openEmojiPicker) {
      emojiPicker.style.display = 'none';
    }
  });
  clearEmojiBtn.addEventListener('click', () => {
    emojiInput.value = '';
  });

  const userScoreEl = document.getElementById('userScore');
  const userLevelEl = document.getElementById('userLevel');
  const monthlyReportBtn = document.getElementById('monthlyReportBtn');
  const monthlyReportModal = document.getElementById('monthlyReportModal');
  const achievementModal = document.getElementById('achievementModal');

  let userProgress = { score: 0, level: 1 };

  async function updateUserScore(points) {
    userProgress.score += points;
    userProgress.level = Math.floor(userProgress.score / 100) + 1;
    userScoreEl.textContent = userProgress.score;
    userLevelEl.textContent = userProgress.level;
    await updateUserProgressFirebase(firebaseAuth.currentUser.uid, userProgress);
  }

  async function loadUserProgress() {
    if (!firebaseAuth.currentUser) {
      console.warn("Usuário não autenticado; pulando loadUserProgress");
      return;
    }
    userProgress = await loadUserProgressFirebase(firebaseAuth.currentUser.uid);
    userScoreEl.textContent = userProgress.score || 0;
    userLevelEl.textContent = userProgress.level || 1;
  }
  
  loadUserProgress();

  function generateMonthlyReport() {
    const currentMonth = new Date().getMonth();
    const events = calendar.getEvents();
    const monthEvents = events.filter(event => new Date(event.start).getMonth() === currentMonth);
    const completedEvents = monthEvents.filter(event => event.extendedProps.completed);
    const activitySummary = document.getElementById('activitySummary');
    activitySummary.innerHTML = `
      <p>Total de Eventos: ${monthEvents.length}</p>
      <p>Eventos Concluídos: ${completedEvents.length}</p>
      <p>Taxa de Conclusão: ${(completedEvents.length / monthEvents.length * 100).toFixed(2)}%</p>
    `;
    const dayActivity = monthEvents.reduce((acc, event) => {
      const day = new Date(event.start).getDate();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    const mostActiveDays = document.getElementById('mostActiveDays');
    mostActiveDays.innerHTML = Object.entries(dayActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day, count]) => `<p>Dia ${day}: ${count} eventos</p>`)
      .join('');
    const uncompletedActivities = monthEvents.filter(event => !event.extendedProps.completed);
    const uncompletedList = document.getElementById('uncompletedActivities');
    uncompletedList.innerHTML = uncompletedActivities
      .map(event => `<p>${event.title} - ${new Date(event.start).toLocaleDateString()}</p>`)
      .join('');
  }

  function validateEventForm() {
    const title = document.getElementById('eventTitle').value.trim();
    const start = document.getElementById('eventStart').value.trim();
    const recurrenceType = document.getElementById('recurrenceType').value;
    if (!title) {
      alert('Por favor, insira um título para o evento.');
      return false;
    }
    if (!start) {
      alert('Por favor, selecione uma data e hora para o evento.');
      return false;
    }
    if (recurrenceType === 'custom') {
      const selectedDays = document.querySelectorAll('input[name="recurDay"]:checked');
      if (selectedDays.length === 0) {
        alert('Por favor, selecione pelo menos um dia para eventos personalizados.');
        return false;
      }
      const endDate = document.getElementById('recurrenceEndDate').value.trim();
      if (!endDate) {
        alert('Por favor, selecione uma data final para eventos personalizados.');
        return false;
      }
    }
    return true;
  }

  function customEventRender(info) {
    try {
      if (!info || !info.el || !info.event) {
        console.warn('Informações do evento inválidas:', info);
        return;
      }
      const event = info.event;
      let html = "";
      
      // 1. Adiciona a bolinha (ponto) primeiro
      if (event.extendedProps.createdBy) {
        let dotColor = "";
        if (event.extendedProps.createdBy === "TgqY2fwdFuRqtFyqBPXkUaABkbW2") {
          dotColor = "blue";
        } else if (event.extendedProps.createdBy === "1MMo9n9B9Sa02Uz9xJEiGnRkbi92") {
          dotColor = "pink";
        }
        html += `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${dotColor}; margin-right:5px;"></span>`;
      }
      
      // 2. Adiciona o ícone (se houver)
      if (event.extendedProps.icon) {
        html += window.getIconHTML(event.extendedProps.icon) + " ";
      }
      
      // 3. Adiciona o título "cru" (rawTitle ou title)
      const displayTitle = (event.extendedProps.rawTitle || event.title).trim();
      html += displayTitle;
      
      // 4. Se houver emoji, adiciona-o depois do título
      if (event.extendedProps.emoji) {
        html += " " + event.extendedProps.emoji;
      }
      
      // Atribui a string completa ao elemento de título
      const titleEl = info.el.querySelector('.fc-event-title');
      if (titleEl) {
        titleEl.innerHTML = html;
      }
    } catch (error) {
      console.error("Erro na customização do evento:", error);
    }
  }
          
  eventForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateEventForm()) {
      return;
    }
    
    const eventId = document.getElementById('eventId').value;
    const title = document.getElementById('eventTitle').value.trim();
    const start = document.getElementById('eventStart').value;
    const icon = document.getElementById('eventIcon').value;
    const emoji = document.getElementById('eventEmoji').value;
    const recurrence = document.getElementById('recurrenceType').value;
    const description = document.getElementById('eventDescription').value;
    const completed = document.getElementById('eventCompleted').checked;
    const rawTitle = title;  // Título "cru"
    const pointsInput = document.getElementById('eventPoints');
    const taskPoints = pointsInput ? Number(pointsInput.value) : 0;
    
    const recurrenceConfig = {
      type: recurrence,
      frequency: 1,
      days: [],
      endDate: null
    };
    if (recurrence === 'custom') {
      const selectedDays = Array.from(document.querySelectorAll('input[name="recurDay"]:checked'))
                                .map(checkbox => parseInt(checkbox.value));
      recurrenceConfig.days = selectedDays;
      recurrenceConfig.frequency = document.getElementById('recurrenceFrequency').value;
      recurrenceConfig.endDate = document.getElementById('recurrenceEndDate').value || null;
    } else if (recurrence === 'weekdays') {
      recurrenceConfig.days = [1, 2, 3, 4, 5];
    }
    
    const currentCalendar = document.getElementById("calendarSelect").value;
    const newId = eventId || (firebaseAuth.currentUser.uid + "-" + Date.now().toString());
    
    const eventConfig = {
      id: newId,
      title: title,
      start: start,
      description: description,
      extendedProps: {
        rawTitle: rawTitle,
        completed: completed,
        recurrence: recurrenceConfig,
        icon: icon,
        emoji: emoji,
        calendar: currentCalendar,
        createdBy: firebaseAuth.currentUser.uid,
        taskPoints: taskPoints
      }
    };
    
    try {
      await salvarEventoFirebase(eventConfig, firebaseAuth.currentUser, currentCalendar);
      await updateUserScore(taskPoints);
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar o evento no Firebase:", error);
      alert("Erro ao salvar o evento. Veja o console para detalhes.");
    }
  });
  
  deleteEventBtn.addEventListener('click', async function() {
    const eventId = document.getElementById('eventId').value;
    if (eventId) {
      try {
        await apagarEventoFirebase(eventId, firebaseAuth.currentUser, document.getElementById("calendarSelect").value);
        const existingEvent = calendar.getEventById(eventId);
        if (existingEvent) {
          existingEvent.remove();
        }
        closeModal();
      } catch (error) {
        console.error("Erro ao apagar o evento:", error);
        alert("Erro ao apagar o evento. Veja o console para detalhes.");
      }
    }
  });

  let eventToDelete = null;
  calendar.on('eventClick', function(info) {
    const event = info.event;
    const baseEventId = event.id.split('-')[0];
    const recurrence = event.extendedProps.recurrence;
    if (recurrence && recurrence.type !== 'none') {
      eventToDelete = event;
      const deleteRecurringModal = document.getElementById('deleteRecurringModal');
      deleteRecurringModal.style.display = 'block';
    } else {
      openEventModal(null, event);
    }
  });

  function deleteRecurringEvents() {
    if (!eventToDelete) return;
    const deleteOption = document.querySelector('input[name="deleteOption"]:checked').value;
    const baseEventId = eventToDelete.id.split('-')[0];
    if (deleteOption === 'all') {
      const eventsToRemove = calendar.getEvents().filter(event => event.id.startsWith(baseEventId));
      eventsToRemove.forEach(event => event.remove());
    } else {
      eventToDelete.remove();
    }
    document.getElementById('deleteRecurringModal').style.display = 'none';
    eventToDelete = null;
  }
  document.getElementById('confirmDeleteRecurring').addEventListener('click', deleteRecurringEvents);
  document.getElementById('deleteRecurringModal').querySelector('.close').addEventListener('click', function() {
    document.getElementById('deleteRecurringModal').style.display = 'none';
    eventToDelete = null;
  });
});

export { calendar };
