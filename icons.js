document.addEventListener('DOMContentLoaded', () => {
    const iconList = [
        'event', 'work', 'sports', 'school', 'favorite', 'flight', 
        'shopping_cart', 'fitness_center', 'home', 'restaurant', 'music_note', 
        'laptop', 'phone', 'email', 'local_airport', 'directions_car', 
        'local_hospital', 'local_cafe', 'local_library', 'weekend', 'beach_access', 
        'golf_course', 'hiking', 'movie', 'brush', 'science', 'wb_sunny', 
        'nightlight_round', 'cloud', 'water', 'park', 'pets', 'cake', 
        'celebration', 'coffee', 'laptop_mac', 'smartphone', 'videogame_asset', 
        'inventory', 'family_restroom', 'medical_services', 'sports_soccer', 
        'sports_tennis', 'sports_esports', 'task', 'water_drop', 'bedtime', 
        'self_improvement', 'psychology', 'savings', 'nature', 'waves', 
        'music_video', 'palette', 'memory', 'calculate', 'accessibility', 
        'agriculture', 'air', 'anchor', 'architecture', 'backpack', 
        'battery_charging_full', 'biotech', 'border_color', 'brush', 
        'build', 'camera_alt', 'card_giftcard', 'celebration', 'child_care'
    ];

    const iconPickerGrid = document.getElementById('iconPickerGrid');
    const iconPickerTrigger = document.getElementById('iconPickerTrigger');
    const iconPicker = document.getElementById('iconPicker');
    const eventIcon = document.getElementById('eventIcon');

    window.getIconHTML = function(iconName) {
        return iconName ? `<span class="material-icons event-icon">${iconName}</span>` : '';
    };

    iconList.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.classList.add('icon-picker-item');
        iconItem.innerHTML = `<i class="material-icons">${icon}</i>`;
        iconItem.addEventListener('click', () => {
            eventIcon.value = icon;
            iconPickerTrigger.innerHTML = `<i class="material-icons">${icon}</i>`;
            iconPicker.style.display = 'none';
        });
        iconPickerGrid.appendChild(iconItem);
    });

    iconPickerTrigger.addEventListener('click', (event) => {
        event.stopPropagation();  
        iconPicker.style.display = iconPicker.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!iconPicker.contains(event.target) && event.target !== iconPickerTrigger) {
            iconPicker.style.display = 'none';
        }
    });

    iconPicker.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});
