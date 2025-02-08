import { firebaseAuth } from "./auth.js";
import { salvarEventoFirebase, apagarEventoFirebase } from "./firebaseEvents.js";

// Declare a variável "calendar" no nível de módulo para que possamos exportá-la.
let calendar;

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  const eventModal = document.getElementById('eventModal');
  const addEventBtn = document.getElementById('addEventBtn');
  const closeModalBtn = document.querySelector('.close');
  const eventForm = document.getElementById('eventForm');
  const deleteEventBtn = document.getElementById('deleteEventBtn');
  const modalTitle = document.getElementById('modalTitle');

  // Configuração do FullCalendar
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
    eventDidMount: customEventRender
  });
  calendar.render();

  // Configuração do Flatpickr para o input de data/hora
  const eventStartInput = document.getElementById('eventStart');
  const flatpickrInstance = flatpickr(eventStartInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    locale: "pt",
    time_24hr: true
  });

  // Função para abrir o modal de evento
  function openEventModal(date = null, existingEvent = null) {
    eventForm.reset();
    deleteEventBtn.style.display = 'none';
    modalTitle.textContent = 'Adicionar Novo Evento';
    document.getElementById('eventId').value = '';

    // Reseta recorrência
    recurrenceTypeSelect.value = 'none';
    document.getElementById('customRecurrenceGroup').style.display = 'none';
    document.querySelectorAll('input[name="recurDay"]').forEach(chk => chk.checked = false);
    document.getElementById('recurrenceFrequency').selectedIndex = 0;
    document.getElementById('recurrenceEndDate').value = '';

    if (existingEvent) {
      document.getElementById('eventTitle').value = existingEvent.title.replace(/<i class="material-icons">[^<]+<\/i>/g, '').trim();
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
    } else if (date) {
      flatpickrInstance.setDate(date);
    }
    eventModal.style.display = 'block';
  }

  // Função para fechar o modal
  function closeModal() {
    eventModal.style.display = 'none';
    eventForm.reset();
  }

  addEventBtn.addEventListener('click', () => openEventModal());
  closeModalBtn.addEventListener('click', closeModal);

  // Manipulação do tipo de recorrência
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

  // Configuração do emoji
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

  // Recursos de gamificação (mantidos conforme seu código)
  const userScoreEl = document.getElementById('userScore');
  const userLevelEl = document.getElementById('userLevel');
  const monthlyReportBtn = document.getElementById('monthlyReportBtn');
  const monthlyReportModal = document.getElementById('monthlyReportModal');
  const achievementModal = document.getElementById('achievementModal');

  const userProgress = {
    score: 0,
    level: 1,
    monthlyStats: {},
    achievements: []
  };

  function updateUserScore(points) {
    userProgress.score += points;
    userProgress.level = Math.floor(userProgress.score / 100) + 1;
    userScoreEl.textContent = userProgress.score;
    userLevelEl.textContent = userProgress.level;
    checkAchievements();
    saveUserProgress();
  }

  function checkAchievements() {
    const achievements = [
      { name: 'Primeiro Passo', condition: () => userProgress.score >= 50 },
      { name: 'Consistência', condition: () => userProgress.score >= 200 },
      { name: 'Mestre da Organização', condition: () => userProgress.level >= 5 }
    ];
    achievements.forEach(achievement => {
      if (achievement.condition() && !userProgress.achievements.includes(achievement.name)) {
        userProgress.achievements.push(achievement.name);
        showAchievementModal(achievement.name);
      }
    });
  }

  function showAchievementModal(achievementName) {
    const achievementContent = document.getElementById('achievementContent');
    achievementContent.innerHTML = `
      <i class="material-icons" style="font-size: 64px; color: var(--accent-color);">stars</i>
      <h3>Parabéns!</h3>
      <p>Você desbloqueou a conquista: ${achievementName}</p>
    `;
    achievementModal.style.display = 'block';
    setTimeout(() => {
      achievementModal.style.display = 'none';
    }, 3000);
  }

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

  // Função de validação do formulário
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

  // Função para customizar a renderização dos eventos no calendário
  function customEventRender(info) {
    try {
      if (!info || !info.el || !info.event) {
        console.warn('Informações do evento inválidas:', info);
        return;
      }
      const el = info.el;
      const event = info.event;
      const titleEl = el.querySelector('.fc-event-title');
      if (titleEl) {
        titleEl.innerHTML = '';
        if (event.extendedProps.icon) {
          const iconContainer = document.createElement('span');
          iconContainer.innerHTML = window.getIconHTML(event.extendedProps.icon);
          titleEl.appendChild(iconContainer);
          titleEl.appendChild(document.createTextNode(' '));
        }
        const textNode = document.createTextNode(event.title);
        titleEl.appendChild(textNode);
        if (event.extendedProps.emoji) {
          titleEl.appendChild(document.createTextNode(' '));
          const emojiContainer = document.createElement('span');
          emojiContainer.textContent = event.extendedProps.emoji;
          titleEl.appendChild(emojiContainer);
        }
      }
    } catch (error) {
      console.error('Erro na customização do evento:', error);
    }
  }

  // Listener de envio do formulário para salvar o evento no Firebase
  eventForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validateEventForm()) {
      return;
    }
    
    const eventId = document.getElementById('eventId').value;
    const title = document.getElementById('eventTitle').value;
    const start = document.getElementById('eventStart').value;
    const icon = document.getElementById('eventIcon').value;
    const emoji = document.getElementById('eventEmoji').value;
    const recurrence = document.getElementById('recurrenceType').value;
    const description = document.getElementById('eventDescription').value;
    const completed = document.getElementById('eventCompleted').checked;
    const formattedTitle = title;
    const recurrenceConfig = {
      type: recurrence,
      frequency: 1,
      days: [],
      endDate: null
    };
    
    if (recurrence === 'custom') {
      const selectedDays = Array.from(
        document.querySelectorAll('input[name="recurDay"]:checked')
      ).map(checkbox => parseInt(checkbox.value));
      recurrenceConfig.days = selectedDays;
      recurrenceConfig.frequency = document.getElementById('recurrenceFrequency').value;
      recurrenceConfig.endDate = document.getElementById('recurrenceEndDate').value || null;
    } else if (recurrence === 'weekdays') {
      recurrenceConfig.days = [1, 2, 3, 4, 5];
    }
    
    // Obtém o calendário selecionado pelo dropdown
    const currentCalendar = document.getElementById("calendarSelect").value;
    
    // Monta o objeto do evento
    const eventConfig = {
      id: eventId || Date.now().toString(),
      title: formattedTitle,
      start: start,
      description: description,
      extendedProps: {
        completed: completed,
        recurrence: recurrenceConfig,
        icon: icon,
        emoji: emoji,
        calendar: currentCalendar
      }
    };
    
    try {
      // Salva o evento no Firebase na coleção correspondente e na subcoleção do usuário
      await salvarEventoFirebase(eventConfig, firebaseAuth.currentUser, currentCalendar);
      // Adiciona o evento no FullCalendar (opcional: o listener onSnapshot pode atualizar a interface)
      calendar.addEvent(eventConfig);
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar o evento no Firebase:", error);
      alert("Erro ao salvar o evento. Veja o console para detalhes.");
    }
  });

  // Listener para apagar evento (chama a função do Firebase)
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

  // Exclusão de eventos recorrentes (mantida)
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

  // Funções para salvar e carregar o progresso do usuário (mantidas via localStorage para gamificação)
  function loadUserProgress() {
    const savedProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    Object.assign(userProgress, savedProgress);
    userScoreEl.textContent = userProgress.score || 0;
    userLevelEl.textContent = userProgress.level || 1;
  }
  function saveUserProgress() {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }
  loadUserProgress();
});

export { calendar };
