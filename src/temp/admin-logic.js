/* --- DATOS SIMULADOS (MOCK DATA) --- */

// 1. Estadísticas (KPIs)
const kpiData = [
    { label: "Total Médicos", value: 12, icon: "bx-user-voice", color: "icon-blue" },
    { label: "Total Pacientes", value: 845, icon: "bx-user", color: "icon-green" },
    { label: "Citas Hoy", value: 28, icon: "bx-calendar-check", color: "icon-orange" },
    { label: "Solicitudes", value: 5, icon: "bx-envelope", color: "icon-red" }
];

// 2. Lista de Médicos
const doctorsData = [
    { 
        id: 1, 
        name: "Dr. Sebastian J.", 
        specialty: "Cardiología", 
        status: "active", // active o inactive
        avatar: "https://i.pravatar.cc/150?img=11" 
    },
    { 
        id: 2, 
        name: "Dra. Maria Lopez", 
        specialty: "Pediatría", 
        status: "active", 
        avatar: "https://i.pravatar.cc/150?img=5" 
    },
    { 
        id: 3, 
        name: "Dr. Roberto Gomez", 
        specialty: "Dermatología", 
        status: "inactive", 
        avatar: "https://i.pravatar.cc/150?img=3" 
    },
    { 
        id: 4, 
        name: "Dra. Ana Torres", 
        specialty: "Neurología", 
        status: "active", 
        avatar: null // Prueba sin foto (usará iniciales)
    }
];

// 3. Lista de Pacientes
const patientsData = [
    { 
        id: 201, 
        name: "Carlos Jimenez", 
        lastVisit: "02 Mar, 2025", 
        insurance: "Sura", 
        initials: "CJ",
        color: "" // Azul por defecto
    },
    { 
        id: 202, 
        name: "Ana Lopez", 
        lastVisit: "28 Feb, 2025", 
        insurance: "Coomeva", 
        initials: "AL",
        color: "pink"
    },
    { 
        id: 203, 
        name: "Pedro Martinez", 
        lastVisit: "27 Feb, 2025", 
        insurance: "Particular", 
        initials: "PM",
        color: "purple"
    }
];


/* --- FUNCIONES DE RENDERIZADO --- */

// A. Renderizar Estadísticas
function renderStats() {
    const container = document.getElementById('kpi-container');
    let htmlContent = '';

    kpiData.forEach(stat => {
        htmlContent += `
            <div class="stat-card">
                <div class="stat-info">
                    <p>${stat.label}</p>
                    <h3>${stat.value}</h3>
                </div>
                <div class="stat-icon ${stat.color}">
                    <i class='bx ${stat.icon}'></i>
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlContent;
}

// B. Renderizar Tabla de Médicos
function renderDoctors() {
    const tbody = document.getElementById('doctors-table-body');
    let htmlContent = '';

    doctorsData.forEach(doc => {
        // Lógica para el estado (texto y color)
        const statusText = doc.status === 'active' ? 'Activo' : 'Inactivo';
        const statusClass = doc.status === 'active' ? 'active' : 'inactive';
        
        // Lógica para avatar (Imagen o Icono genérico si es null)
        const avatarHtml = doc.avatar 
            ? `<img src="${doc.avatar}" alt="${doc.name}">` 
            : `<div class="initial-avatar">${doc.name.charAt(4)}</div>`; // Toma la inicial del nombre

        htmlContent += `
            <tr>
                <td class="user-cell">
                    ${avatarHtml}
                    <span>${doc.name}</span>
                </td>
                <td>${doc.specialty}</td>
                <td><span class="status-dot ${statusClass}"></span> ${statusText}</td>
                <td>
                    <button class="action-btn edit" title="Editar"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn delete" title="Borrar"><i class='bx bx-trash'></i></button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = htmlContent;
}

// C. Renderizar Tabla de Pacientes
function renderPatients() {
    const tbody = document.getElementById('patients-table-body');
    let htmlContent = '';

    patientsData.forEach(pat => {
        htmlContent += `
            <tr>
                <td class="user-cell">
                    <div class="initial-avatar ${pat.color}">${pat.initials}</div>
                    <span>${pat.name}</span>
                </td>
                <td>${pat.lastVisit}</td>
                <td>${pat.insurance}</td>
                <td>
                    <button class="action-btn view" title="Ver Historial"><i class='bx bx-show'></i></button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = htmlContent;
}

/* --- INICIALIZACIÓN --- */
// Ejecutar cuando el HTML cargue
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderDoctors();
    renderPatients();
});