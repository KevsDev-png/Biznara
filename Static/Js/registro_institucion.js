document.addEventListener('DOMContentLoaded', function () {
    let stylesInjected = false;

    /**
     * Inyecta los estilos CSS para las notificaciones en el <head> del documento.
     * Se ejecuta solo una vez para evitar duplicados.
     */
    function injectNotificationStyles() {
        if (stylesInjected) return;

        const style = document.createElement('style');
        style.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                background-color: #333; /* Default/Info */
                z-index: 20000;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateX(100%);
                transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                font-family: Arial, sans-serif;
                font-size: 15px;
                max-width: 350px;
            }
            .custom-notification.error { background-color: #d9534f; }
            .custom-notification.success { background-color: #5cb85c; }
            .custom-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            /* Estilos responsivos para pantallas pequeñas */
            @media (max-width: 600px) {
                .custom-notification {
                    left: 10px;
                    right: 10px;
                    top: 10px;
                    max-width: none;
                    width: auto;
                }
            }
        `;
        document.head.appendChild(style);
        stylesInjected = true;
    }

    /**
     * Muestra una notificación no bloqueante en la pantalla.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('error', 'success', 'info').
     */
    function showNotification(message, type = 'error') {
        injectNotificationStyles(); // Asegura que los estilos estén presentes

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `custom-notification ${type}`; // Asigna clases base y de tipo

        document.body.appendChild(notification);

        // Animación de entrada y salida
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            // Espera a que termine la transición de salida para eliminar el elemento
            notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        }, 5000); // La notificación dura 5 segundos
    }

    // --- Funcionalidad para mostrar/ocultar contraseña ---
    window.togglePassword = function() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eye-icon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    }

    // --- Validación para requerir al menos un checkbox de participación ---
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function (event) {
            const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
            const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

            if (!isChecked) {
                event.preventDefault(); // Previene el envío del formulario
                showNotification('Por favor, selecciona al menos un área de participación activa.', 'error');
                checkboxes[0].focus();
            }
        });
    }

    // --- Validación de correo electrónico ---
    // Hacemos la función global para que el `onblur` del HTML la encuentre.
    window.validarCorreo = function(email) {
        const expReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        const esValido = expReg.test(email);
       
        if (email && !esValido) { // Solo muestra la alerta si hay texto y no es válido.
            showNotification("El correo no es válido o ya esta registrado. Por favor, ingrese un correo válido.", 'error');
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }
    };

    // --- Validación de Contraseña ---
    const passwordInput = document.getElementById('password');

    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            const password = this.value;
            if (password && !validarContraseña(password)) {
                showNotification('La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y un símbolo !@#$%^&*._-', 'error');
            }
        });
    }

    function validarContraseña(password) {
        // La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula, un número y un caracter especial.
        const expReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-])[A-Za-z\d!@#$%^&*._-]{8,}$/;
        return expReg.test(password);
    }

    function validarNIT(nit) {
        // Expresión regular para un NIT colombiano: 10 dígitos sin guion.
        const expRegNIT = /^\d{10}$/;
        return expRegNIT.test(nit);
    }

    // --- Validación de NIT ---
    const nitInput = document.getElementById('nit');
    if (nitInput) {
        // Evento para permitir solo la entrada de números en tiempo real
        nitInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });

        nitInput.addEventListener('blur', function() {
            const nit = this.value;
            if (nit && !validarNIT(nit)) {
                showNotification('El NIT no es válido. Debe contener 10 dígitos numéricos, sin guiones ni puntos.', 'error');
            }
        });
    }

});