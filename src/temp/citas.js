/* ARCHIVO: citas.js
   SIMULACIÓN DE BACKEND Y LÓGICA DE RENDERIZADO 
*/

// 1. DATOS FALSOS (JSON que vendría de tu API / Angular)
// gridColumn: 2 = Lunes, 3 = Martes, etc. (Porque columna 1 es la hora)
// gridRow: 1 = 8am, 2 = 9am... (Depende de tu hora de inicio)
const citasData = [
    {
        id: 101,
        paciente: "Sebastian Jimenez",
        tipo: "Cardiología",
        hora: "09:00 AM - 10:00 AM",
        estado: "confirmado",
        gridColumn: 3, // Martes
        gridRow: 2     // 9:00 AM (Si fila 1 es 8am)
    },
    {
        id: 102,
        paciente: "Maria Gonzalez",
        tipo: "Control General",
        hora: "08:00 AM - 09:00 AM",
        estado: "pendiente",
        gridColumn: 2, // Lunes
        gridRow: 1     // 8:00 AM
    },
    {
        id: 103,
        paciente: "Carlos Perez",
        tipo: "Lectura de Exámenes",
        hora: "02:00 PM - 03:00 PM",
        estado: "confirmado",
        gridColumn: 5, // Jueves
        gridRow: 7     // 2:00 PM (12pm=5, 1pm=6, 2pm=7)
    },
    {
        id: 104,
        paciente: "Ana Rojas",
        tipo: "Urgencia Leve",
        hora: "11:00 AM - 12:00 PM",
        estado: "confirmado",
        gridColumn: 6, // Viernes
        gridRow: 4     // 11:00 AM
    }
];

// 2. FUNCIÓN PARA RENDERIZAR LAS CITAS EN EL CALENDARIO
function renderizarCalendario() {
    const calendarBody = document.getElementById('calendar-body');
    
    // Recorremos los datos
    citasData.forEach(cita => {
        // Crear el elemento DIV de la tarjeta
        const card = document.createElement('div');
        card.classList.add('cita-card');
        
        // Agregar clase de color según estado
        if(cita.estado === 'confirmado') card.classList.add('cita-confirmado');
        if(cita.estado === 'pendiente') card.classList.add('cita-pendiente');

        // POSICIONAMIENTO EN GRID (CSS Mágico)
        card.style.gridColumn = cita.gridColumn;
        card.style.gridRow = cita.gridRow;

        // Contenido HTML interno de la tarjeta
        card.innerHTML = `
            <strong>${cita.paciente}</strong>
            <span>${cita.tipo}</span>
        `;

        // EVENTO CLICK: Abrir Modal
        card.addEventListener('click', () => abrirModal(cita));

        // Insertar en el HTML
        calendarBody.appendChild(card);
    });
}

// 3. LÓGICA DEL MODAL (Pop-up)
const modal = document.getElementById('cita-modal');
const btnClose = document.getElementById('close-modal');

// Elementos dentro del modal a rellenar
const mPatient = document.getElementById('m-patient');
const mType = document.getElementById('m-type');
const mTime = document.getElementById('m-time');
const mStatus = document.getElementById('m-status');

function abrirModal(cita) {
    // 1. Llenar datos
    mPatient.textContent = cita.paciente;
    mType.textContent = cita.tipo;
    mTime.textContent = cita.hora;
    
    mStatus.textContent = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);
    
    // Resetear clases del badge
    mStatus.className = 'badge'; 
    mStatus.classList.add(cita.estado); // 'confirmado' o 'pendiente'

    // 2. Mostrar modal
    modal.classList.remove('hidden');
}

// Cerrar Modal
btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Cerrar si clic fuera del modal
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', renderizarCalendario);