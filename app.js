document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const eventModal = document.getElementById('eventModal');
    const addEventBtn = document.getElementById('addEventBtn');
    const closeModalBtn = document.querySelector('.close');
    const eventForm = document.getElementById('eventForm');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const modalTitle = document.getElementById('modalTitle');

    // Configuração do Calendário
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'pt-br',
        editable: true,
        events: [], // Eventos serão carregados aqui
        dateClick: function(info) {
            openEventModal(info.date);
        },
        eventContent: customEventRender
    });
    calendar.render();

    // Configuração do Flatpickr
    const eventStartInput = document.getElementById('eventStart');
    const flatpickrInstance = flatpickr(eventStartInput, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        locale: "pt",
        time_24hr: true
    });

    // Abrir Modal de Evento
    function openEventModal(date = null, existingEvent = null) {
        // Reset form and modal
        eventForm.reset();
        deleteEventBtn.style.display = 'none';
        modalTitle.textContent = 'Adicionar Novo Evento';
        document.getElementById('eventId').value = '';

        // Reset recurrence type and hide custom options
        recurrenceTypeSelect.value = 'none';
        document.getElementById('customRecurrenceGroup').style.display = 'none';
        
        // Reset checkboxes
        document.querySelectorAll('input[name="recurDay"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('recurrenceFrequency').selectedIndex = 0;
        document.getElementById('recurrenceEndDate').value = '';

        if (existingEvent) {
            // Populate form with existing event details
            document.getElementById('eventTitle').value = existingEvent.title.replace(/<i class="material-icons">[^<]+<\/i>/g, '').replace(/^\s+|\s+$/g, '').replace(/^[\ufe0f]/g, '');
            document.getElementById('eventStart').value = existingEvent.startStr;
            document.getElementById('eventDescription').value = existingEvent.extendedProps.description || '';
            document.getElementById('eventId').value = existingEvent.id;
            document.getElementById('eventCompleted').checked = existingEvent.extendedProps.completed || false;
            
            // Show delete button for existing events
            deleteEventBtn.style.display = 'flex';
            modalTitle.textContent = 'Editar Evento';

            if (existingEvent.extendedProps.recurrence) {
                const recurrence = existingEvent.extendedProps.recurrence;
                
                // Populate recurrence details if existing event has recurrence
                if (recurrence.type !== 'none') {
                    recurrenceTypeSelect.value = recurrence.type;
                    
                    if (recurrence.type === 'custom') {
                        document.getElementById('customRecurrenceGroup').style.display = 'block';
                        
                        // Check previously selected days
                        if (recurrence.days) {
                            recurrence.days.forEach(day => {
                                const checkbox = document.querySelector(`input[name="recurDay"][value="${day}"]`);
                                if (checkbox) checkbox.checked = true;
                            });
                        }
                        
                        // Set frequency if available
                        if (recurrence.frequency) {
                            document.getElementById('recurrenceFrequency').value = recurrence.frequency;
                        }
                        
                        // Set end date if available
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
            // Set date for new event
            flatpickrInstance.setDate(date);
        }

        eventModal.style.display = 'block';
    }

    // Fechar Modal
    function closeModal() {
        eventModal.style.display = 'none';
        eventForm.reset();
    }

    // Eventos de Click
    addEventBtn.addEventListener('click', () => openEventModal());
    closeModalBtn.addEventListener('click', closeModal);

    // Recurrence type selection handling
    const recurrenceTypeSelect = document.getElementById('recurrenceType');
    const customRecurrenceGroup = document.getElementById('customRecurrenceGroup');
    const recurrenceEndDateInput = document.getElementById('recurrenceEndDate');

    // Flatpickr for recurrence end date
    const recurrenceEndDatePicker = flatpickr(recurrenceEndDateInput, {
        dateFormat: "Y-m-d",
        locale: "pt",
    });

    recurrenceTypeSelect.addEventListener('change', function() {
        const customRecurrenceGroup = document.getElementById('customRecurrenceGroup');
        
        // Reset checkboxes and selections when changing type
        document.querySelectorAll('input[name="recurDay"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('recurrenceFrequency').selectedIndex = 0;
        document.getElementById('recurrenceEndDate').value = '';
        
        // Show/hide based on selected type
        customRecurrenceGroup.style.display = 
            this.value === 'custom' ? 'block' : 'none';
    });

    // Emoji Picker Integration
    const emojiInput = document.getElementById('eventEmoji');
    const emojiPicker = document.querySelector('emoji-picker');

    // Toggle emoji picker
    emojiInput.addEventListener('click', () => {
        emojiPicker.style.display = 
            emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    // Select emoji
    emojiPicker.addEventListener('emoji-click', event => {
        emojiInput.value = event.detail.unicode;
        emojiPicker.style.display = 'none';
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && 
            event.target !== emojiInput) {
            emojiPicker.style.display = 'none';
        }
    });

    // Gamification Features
    const userScoreEl = document.getElementById('userScore');
    const userLevelEl = document.getElementById('userLevel');
    const monthlyReportBtn = document.getElementById('monthlyReportBtn');
    const monthlyReportModal = document.getElementById('monthlyReportModal');
    const achievementModal = document.getElementById('achievementModal');

    // User Progress Tracking
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

    // Monthly Report Generation
    function generateMonthlyReport() {
        const currentMonth = new Date().getMonth();
        const events = calendar.getEvents();
        
        const monthEvents = events.filter(event => 
            new Date(event.start).getMonth() === currentMonth
        );

        const completedEvents = monthEvents.filter(event => 
            event.extendedProps.completed
        );

        const activitySummary = document.getElementById('activitySummary');
        activitySummary.innerHTML = `
            <p>Total de Eventos: ${monthEvents.length}</p>
            <p>Eventos Concluídos: ${completedEvents.length}</p>
            <p>Taxa de Conclusão: ${(completedEvents.length / monthEvents.length * 100).toFixed(2)}%</p>
        `;

        // Most Active Days
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

        // Uncompleted Activities
        const uncompletedActivities = monthEvents.filter(event => !event.extendedProps.completed);
        const uncompletedList = document.getElementById('uncompletedActivities');
        uncompletedList.innerHTML = uncompletedActivities
            .map(event => `<p>${event.title} - ${new Date(event.start).toLocaleDateString()}</p>`)
            .join('');
    }

    // Form Validation Function
    function validateEventForm() {
        const title = document.getElementById('eventTitle').value.trim();
        const start = document.getElementById('eventStart').value.trim();
        const recurrenceType = document.getElementById('recurrenceType').value;

        // Title validation
        if (!title) {
            alert('Por favor, insira um título para o evento.');
            return false;
        }

        // Start date validation
        if (!start) {
            alert('Por favor, selecione uma data e hora para o evento.');
            return false;
        }

        // Custom recurrence validation
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
                console.warn('Invalid event info:', info);
                return;
            }

            const el = info.el;
            const event = info.event;
            
            // Safely extract title without HTML tags
            const titleWithoutTags = event.title.replace(/<[^>]*>/g, '').trim();
            
            // Extract icon if present
            const iconMatch = event.title.match(/<i class="material-icons">([^<]+)<\/i>/);
            const eventIcon = iconMatch ? iconMatch[1] : null;

            // Create clean title without icon tag
            const cleanTitle = titleWithoutTags;

            // Update event title
            const titleEl = el.querySelector('.fc-event-title');
            if (titleEl) {
                // Clear existing content
                titleEl.innerHTML = '';

                // Add icon if exists (using global function)
                if (eventIcon) {
                    const iconSpan = document.createElement('span');
                    iconSpan.className = 'material-icons event-icon';
                    iconSpan.textContent = eventIcon;
                    titleEl.appendChild(iconSpan);
                }

                // Add text content
                const textNode = document.createTextNode(cleanTitle);
                titleEl.appendChild(textNode);
            }
        } catch (error) {
            console.error('Error in customEventRender:', error);
        }
    }

    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add form validation
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

        // Updated title generation to use global icon handling
        const formattedTitle = `${emoji ? emoji + ' ' : ''}${title}${icon ? ` ${window.getIconHTML(icon)}` : ''}`;

        // Rest of the existing code remains the same...
        const recurrenceConfig = {
            type: recurrence,
            frequency: 1,
            days: [],
            endDate: null
        };

        if (recurrence === 'custom') {
            // Get selected days
            const selectedDays = Array.from(
                document.querySelectorAll('input[name="recurDay"]:checked')
            ).map(checkbox => parseInt(checkbox.value));

            recurrenceConfig.days = selectedDays;
            recurrenceConfig.frequency = 
                document.getElementById('recurrenceFrequency').value;
            recurrenceConfig.endDate = 
                document.getElementById('recurrenceEndDate').value || null;
        } else if (recurrence === 'weekdays') {
            recurrenceConfig.days = [1, 2, 3, 4, 5]; // Mon-Fri
        }

        const eventConfig = {
            id: eventId || Date.now().toString(),
            title: formattedTitle,
            start: start,
            description: description,
            extendedProps: {
                completed: completed,
                recurrence: recurrenceConfig,
                icon: icon,
                emoji: emoji
            }
        };

        // Handle event generation based on recurrence
        if (recurrenceConfig.type !== 'none') {
            generateRecurringEvents(eventConfig);
        } else {
            calendar.addEvent(eventConfig);
        }

        closeModal();
        saveEvents();
    });

    function generateRecurringEvents(baseEvent) {
        const recurrence = baseEvent.extendedProps.recurrence;
        const startDate = new Date(baseEvent.start);
        const endDate = recurrence.endDate ? new Date(recurrence.endDate) : new Date(startDate.getFullYear() + 1, 11, 31);

        let currentDate = new Date(startDate);
        let eventCount = 0;

        while (currentDate <= endDate) {
            // Check if current date matches recurrence rules
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
                    // Check if current day is in selected days and matches frequency
                    const weekday = currentDate.getDay();
                    const weeksSinceStart = Math.floor(
                        (currentDate - startDate) / (7 * 24 * 60 * 60 * 1000)
                    );
                    
                    shouldAddEvent = 
                        recurrence.days.includes(weekday) && 
                        (weeksSinceStart % parseInt(recurrence.frequency) === 0);
                    break;
            }

            if (shouldAddEvent) {
                const recurringEvent = {...baseEvent, 
                    start: new Date(currentDate).toISOString(),
                    id: `${baseEvent.id}-${eventCount++}`
                };
                calendar.addEvent(recurringEvent);
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    let eventToDelete = null;

    calendar.on('eventClick', function(info) {
        const event = info.event;
        const baseEventId = event.id.split('-')[0];
        const recurrence = event.extendedProps.recurrence;

        // Check if event is part of a recurring series
        if (recurrence && recurrence.type !== 'none') {
            eventToDelete = event;
            const deleteRecurringModal = document.getElementById('deleteRecurringModal');
            deleteRecurringModal.style.display = 'block';
        } else {
            // Existing single event deletion logic
            openEventModal(null, event);
        }
    });

    function deleteRecurringEvents() {
        if (!eventToDelete) return;

        const deleteOption = document.querySelector('input[name="deleteOption"]:checked').value;
        const baseEventId = eventToDelete.id.split('-')[0];

        if (deleteOption === 'all') {
            // Remove all events with the same base ID
            const eventsToRemove = calendar.getEvents().filter(
                event => event.id.startsWith(baseEventId)
            );
            eventsToRemove.forEach(event => event.remove());
        } else {
            // Remove only the specific event instance
            eventToDelete.remove();
        }

        // Close the modal
        document.getElementById('deleteRecurringModal').style.display = 'none';
        
        // Save changes
        saveEvents();
        
        // Reset the eventToDelete
        eventToDelete = null;
    }

    document.getElementById('confirmDeleteRecurring').addEventListener('click', deleteRecurringEvents);

    document.getElementById('deleteRecurringModal').querySelector('.close').addEventListener('click', function() {
        document.getElementById('deleteRecurringModal').style.display = 'none';
        eventToDelete = null;
    });

    function saveEvents() {
        const events = calendar.getEvents().map(event => ({
            id: event.id,
            title: event.title,
            start: event.startStr,
            description: event.extendedProps.description,
            extendedProps: event.extendedProps
        }));

        // Group events to avoid saving duplicate recurring events
        const uniqueEvents = Array.from(
            new Map(events.map(event => [event.id.split('-')[0], event]))
            .values()
        );

        localStorage.setItem('calendarEvents', JSON.stringify(uniqueEvents));
    }

    function loadEvents() {
        const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        savedEvents.forEach(event => {
            if (event.extendedProps && event.extendedProps.recurrence && event.extendedProps.recurrence.type !== 'none') {
                generateRecurringEvents(event);
            } else {
                calendar.addEvent(event);
            }
        });
    }

    // Deletar Evento
    deleteEventBtn.addEventListener('click', function() {
        const eventId = document.getElementById('eventId').value;
        if (eventId) {
            const existingEvent = calendar.getEventById(eventId);
            if (existingEvent) {
                existingEvent.remove();
            }
            closeModal();
            saveEvents();
        }
    });

    // Monthly Report Modal
    monthlyReportBtn.addEventListener('click', function() {
        generateMonthlyReport();
        monthlyReportModal.style.display = 'block';
    });

    // Close Monthly Report Modal
    monthlyReportModal.querySelector('.close').addEventListener('click', function() {
        monthlyReportModal.style.display = 'none';
    });

    // Load saved progress
    function loadUserProgress() {
        const savedProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
        Object.assign(userProgress, savedProgress);
        
        userScoreEl.textContent = userProgress.score || 0;
        userLevelEl.textContent = userProgress.level || 1;
    }

    function saveUserProgress() {
        localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }

    loadEvents();
    loadUserProgress();
    window.addEventListener('beforeunload', saveEvents);
});