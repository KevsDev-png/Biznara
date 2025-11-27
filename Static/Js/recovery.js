document.addEventListener('DOMContentLoaded', function () {
    let stylesInjected = false;
    const eyeIconPath = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
    const eyeSlashIconPath = "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L21.73 23 23 21.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z";

    /**
     * Inyecta los estilos CSS para las notificaciones en el <head> del documento.
     */
    function injectNotificationStyles() {
        if (stylesInjected) return;
        const style = document.createElement('style');
        style.textContent = `
            .custom-notification {
                position: fixed; top: 20px; right: 20px; padding: 15px 25px;
                border-radius: 8px; color: white; background-color: #333;
                z-index: 20000; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                opacity: 0; transform: translateX(100%);
                transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                font-family: Arial, sans-serif; font-size: 15px; max-width: 350px;
            }
            .custom-notification.error { background-color: #d9534f; }
            .custom-notification.success { background-color: #5cb85c; }
            .custom-notification.show { opacity: 1; transform: translateX(0); }
            @media (max-width: 600px) {
                .custom-notification { left: 10px; right: 10px; top: 10px; max-width: none; width: auto; }
            }
        `;
        document.head.appendChild(style);
        stylesInjected = true;
    }

    /**
     * Muestra una notificación no bloqueante en la pantalla.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('error', 'success').
     */
    function showNotification(message, type = 'error') {
        injectNotificationStyles();
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `custom-notification ${type}`;
        document.body.appendChild(notification);

        // Forzar un reflujo (reflow) para que el navegador registre el estado inicial
        // antes de añadir la clase 'show' y así la transición se ejecute correctamente.
        notification.offsetHeight; 

        setTimeout(() => {
            notification.classList.add('show');
        }, 0); // El timeout puede ser 0, el reflujo es la clave.

        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        }, 5000);
    }

    /**
     * Muestra u oculta la contraseña de un campo de entrada.
     * @param {string} inputId - El ID del campo de contraseña.
     */
    window.togglePassword = function(inputId) {
        const passwordInput = document.getElementById(inputId);
        if (!passwordInput) return;

        // El span del icono es el siguiente elemento hermano del input
        const eyeIconSpan = passwordInput.nextElementSibling;
        const svgPath = eyeIconSpan.querySelector('svg path');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            svgPath.setAttribute('d', eyeSlashIconPath); // Cambia a icono de ojo tachado
        } else {
            passwordInput.type = 'password';
            svgPath.setAttribute('d', eyeIconPath); // Cambia a icono de ojo normal
        }
    }

    // --- Validación de Contraseña ---
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    function validarContraseña(password) {
        // La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula, un número y un caracter especial.
        const expReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-])[A-Za-z\d!@#$%^&*._-]{8,}$/;
        return expReg.test(password);
    }

    if (newPasswordInput) {
        newPasswordInput.addEventListener('blur', function() {
            const password = this.value;
            if (password && !validarContraseña(password)) {
                showNotification('La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y un símbolo !@#$%^&*._-', 'error');
            }
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function() {
            const newPassword = newPasswordInput ? newPasswordInput.value : '';
            const confirmPassword = this.value;
            if (confirmPassword && newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden.', 'error');
            }
        });
    }

    // --- Validación al enviar el formulario ---
    const recoveryForm = document.getElementById('recovery-form');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // ¡Importante! Prevenimos la recarga de la página.

            const submitButton = recoveryForm.querySelector('button[type="submit"]');
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // --- Validaciones del lado del cliente ---
            if (!newPassword || !confirmPassword) {
                showNotification('Ambos campos de contraseña son obligatorios.', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden. Por favor, verifícalas.', 'error');
                confirmPasswordInput.focus();
                return;
            }
            
            if (!validarContraseña(newPassword)) {
                showNotification('La contraseña no cumple los requisitos de seguridad.', 'error');
                newPasswordInput.focus();
                return;
            }

            // --- Envío con Fetch (AJAX) ---
            submitButton.disabled = true;
            submitButton.textContent = 'Cambiando...';

            try {
                const response = await fetch(recoveryForm.action, {
                    method: 'POST',
                    body: new FormData(recoveryForm)
                });

                const result = await response.json();
                showNotification(result.message, result.success ? 'success' : 'error');

                if (result.success) {
                    // Esperamos unos segundos para que el usuario lea el mensaje y luego redirigimos.
                    setTimeout(() => {
                        window.location.href = '/'; // Redirige a la página principal.
                    }, 2500); // 2.5 segundos de espera
                } else {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Cambiar contraseña';
                }
            } catch (error) {
                console.error('Error al cambiar la contraseña:', error);
                showNotification('Error de conexión con el servidor. Inténtalo de nuevo.', 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Cambiar contraseña';
            }
        });
    }
});