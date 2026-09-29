const modal = document.getElementById("eventModal");


/* =========================
   MODAL NUEVO EVENTO
========================= */

function openEventModal() {

    modal.classList.add("show");

}


function closeEventModal() {

    modal.classList.remove("show");

}


/* Cerrar modal al hacer clic afuera */

modal.addEventListener("click", function(event) {

    if (event.target === modal) {
        closeEventModal();
    }

});


/* =========================
   CREAR EVENTO
========================= */

function createEvent(event) {

    event.preventDefault();

    const name = document.getElementById("eventName").value;

    const type = document.getElementById("eventType").value;

    const date = document.getElementById("eventDate").value;


    if (!name || !date) {

        alert("Completa la información del evento.");

        return;

    }


    const formattedDate = new Date(date).toLocaleDateString(
        "es-CO",
        {
            day: "numeric",
            month: "long"
        }
    );


    alert(
        `✦ Evento creado correctamente\n\n` +
        `${name}\n` +
        `${type}\n` +
        `${formattedDate}\n\n` +
        `MIRAGE comenzará a preparar recomendaciones para tu evento.`
    );


    closeEventModal();


    document.getElementById("eventName").value = "";

    document.getElementById("eventDate").value = "";

}


/* =========================
   MIRAGE AI
========================= */

const insights = [

    "Para tu próximo evento recomendamos reservar aproximadamente un 20% del presupuesto para decoración y ambientación.",

    "MIRAGE recomienda confirmar a los invitados pendientes al menos 7 días antes del evento.",

    "Para mejorar la experiencia, puedes distribuir las actividades dejando pequeños espacios de descanso entre ellas.",

    "Una combinación de iluminación cálida y decoración minimalista puede crear una atmósfera elegante sin aumentar demasiado el presupuesto.",

    "Puedes organizar las mesas según los intereses de tus invitados para facilitar la interacción durante el evento."

];


function generateInsight() {

    const container = document.getElementById("aiInsight");

    const randomIndex = Math.floor(
        Math.random() * insights.length
    );

    container.innerHTML = `
        <strong>✦ MIRAGE AI recomienda:</strong><br><br>
        ${insights[randomIndex]}
    `;

}


/* =========================
   NAVEGACIÓN SIDEBAR
========================= */

const navigationLinks =
    document.querySelectorAll(".sidebar-nav a");


navigationLinks.forEach(link => {

    link.addEventListener("click", function() {

        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});


/* =========================
   ANIMACIÓN DE STATS
========================= */

const statNumbers =
    document.querySelectorAll(".stat-card strong");


statNumbers.forEach(number => {

    number.addEventListener("mouseenter", function() {

        this.style.color = "#a66c76";

    });


    number.addEventListener("mouseleave", function() {

        this.style.color = "";

    });

});