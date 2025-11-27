document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA PARA ABRIR Y CERRAR MODALES ---
    const registerBtn = document.getElementById('register-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    const loginBtn = document.getElementById('iniciar');
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal-btn');

    // Función para abrir el modal
    function openModal(event, modal) {
        event.preventDefault(); // Previene que el enlace '#' recargue la página
        modal.classList.remove('hidden');
    }

    // Función para cerrar el modal
    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    // Asignar eventos a los botones
    if (registerBtn && profileModal && closeModalBtn) {
        registerBtn.addEventListener('click', (e) => openModal(e, profileModal));
        closeModalBtn.addEventListener('click', () => closeModal(profileModal));

        // Opcional: Cerrar el modal si se hace clic en el fondo oscuro
        profileModal.addEventListener('click', (event) => {
            // Se asegura de que el clic fue en el fondo (overlay) y no en el contenido
            if (event.target === profileModal) {
                closeModal(profileModal);
            }
        });
    }

    // Asignar eventos para el modal de login
    if (loginBtn && loginModal && closeLoginModalBtn) {
        loginBtn.addEventListener('click', (e) => openModal(e, loginModal));
        closeLoginModalBtn.addEventListener('click', () => closeModal(loginModal));

        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                closeModal(loginModal);
            }
        });
    }


    // --- LÓGICA PARA SELECCIONAR PERFIL ---
    const profileCards = document.querySelectorAll('.profile-card');

    profileCards.forEach(card => {
        card.addEventListener('click', () => {
            // 1. Quitar la clase 'selected' de TODAS las tarjetas
            profileCards.forEach(c => c.classList.remove('selected'));
            // 2. Añadir la clase 'selected' solo a la tarjeta clickeada
            card.classList.add('selected');
        });
    });

    // --- LÓGICA PARA EL BOTÓN CONTINUAR ---
    const continueBtn = profileModal.querySelector('.btn-primary');

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const selectedProfileCard = document.querySelector('.profile-card.selected');
            if (selectedProfileCard) {
                const profile = selectedProfileCard.dataset.profile;
                // Redirigir a la página correspondiente
                window.location.href = `/registro_${profile}`;
            }
        });
    }
});

// --- LÓGICA PARA MOSTRAR/OCULTAR CONTRASEÑA DEL LOGIN MODAL ---
// Se define fuera del DOMContentLoaded para que el 'onclick' del HTML la encuentre.
function toggleLoginPassword() {
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('login-eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        // SVG para ojo abierto (la contraseña es visible)
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    } else {
        passwordInput.type = 'password';
        // SVG para ojo tachado (la contraseña está oculta)
        eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line>';
    }
}