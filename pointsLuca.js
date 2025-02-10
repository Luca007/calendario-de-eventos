/**
 * Calcula os pontos para um evento para Luca.
 * Exemplo: se o título contiver "acordar" e o horário estiver entre 5 e 9,
 * aplica interpolação linear: 5h -> 15 pontos, 9h -> 7 pontos.
 * Você pode expandir essa lógica para outras tarefas.
 * @param {Object} eventConfig - Objeto do evento.
 * @returns {number} Pontos calculados.
 */
export function getPointsForEvent(eventConfig) {
    const title = (eventConfig.extendedProps.rawTitle || eventConfig.title || "").toLowerCase();
    if (title.includes("acordar")) {
    const startStr = eventConfig.start;
    const parts = startStr.split(" ");
    if (parts.length >= 2) {
        const timeParts = parts[1].split(":");
        const hour = Number(timeParts[0]);
        if (hour >= 5 && hour <= 9) {
        // Para Luca: 5h -> 15 pontos, 9h -> 7 pontos
        const points = 15 - ((hour - 5) * (15 - 7)) / (9 - 5);
        return Math.round(points);
        }
    }
    }
    return 0;
}
