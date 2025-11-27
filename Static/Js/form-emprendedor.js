document.addEventListener('DOMContentLoaded', function() {
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
        notification.className = `custom-notification ${type}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove(), { once: true });
        }, 5000);
    }

    // --- Funcionalidad para mostrar/ocultar contraseña ---
    // Hacemos la función global para que el `onclick` del HTML la encuentre.
    window.togglePassword = function() {
        const passwordInput = document.getElementById('contrasena-emprendedor');
        const eyeIcon = document.getElementById('eye-icon-emprendedor');

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

    // --- VALIDACIONES DE CAMPOS ---

    const form = document.getElementById('registro-emprendedor-form');
    if (!form) return;

    const correoInput = document.getElementById('correo-emprendedor');
    const contrasenaInput = document.getElementById('contrasena-emprendedor');
    const celularInput = document.getElementById('celular-emprendedor');
    const docInput = document.querySelector('input[name="numero_documento"]');

    // Permitir solo números en campos numéricos
    [celularInput, docInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
            });
        }
    });

    // Validación de correo al salir del campo
    if (correoInput) {
        correoInput.addEventListener('blur', () => {
            const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
            if (correoInput.value && !emailRegex.test(correoInput.value)) {
                showNotification('El correo no es válido o ya esta registrado. Por favor, ingrese un correo válido.', 'error');
            }
        });
    }

    // Validación de contraseña al salir del campo
    if (contrasenaInput) {
        contrasenaInput.addEventListener('blur', () => {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-]).{8,}$/;
            if (contrasenaInput.value && !passwordRegex.test(contrasenaInput.value)) {
                showNotification('La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y un símbolo (!@#$%^&*._-).', 'error');
            }
        });
    }

    // --- VALIDACIÓN FINAL AL ENVIAR EL FORMULARIO ---
    form.addEventListener('submit', function(event) {
        const requiredFields = [
            'nombre_completo', 'correo', 'contrasena', 'numero_documento', 
            'numero_celular', 'programa_formacion', 'titulo_proyecto', 
            'descripcion_proyecto', 'relacion_sector'
        ];

        // Validar campos de texto y textarea requeridos
        for (const name of requiredFields) {
            const field = form.querySelector(`[name="${name}"]`);
            if (field && field.value.trim() === '') {
                event.preventDefault();
                showNotification(`El campo "${field.placeholder || name.replace(/_/g, ' ')}" no puede estar vacío.`, 'error');
                field.focus();
                return;
            }
        }

        // Validar select de tipo de documento
        const tipoDocField = form.querySelector('[name="tipo_documento"]');
        if (tipoDocField && tipoDocField.value === '') {
            event.preventDefault();
            showNotification('Debes seleccionar un tipo de documento.', 'error');
            tipoDocField.focus();
            return;
        }

        // Validar celular
        if (celularInput.value.length !== 10) {
            event.preventDefault();
            showNotification('El número de celular debe tener exactamente 10 dígitos.', 'error');
            celularInput.focus();
            return;
        }

        // Validar tipo de apoyo
        const tipoApoyo = form.querySelector('input[name="tipo_apoyo"]:checked');
        if (!tipoApoyo) {
            event.preventDefault();
            showNotification('Debes seleccionar un tipo de apoyo que buscas.', 'error');
            return;
        }

        // Validar términos y condiciones
        if (!document.getElementById('terminos-emprendedor').checked) {
            event.preventDefault();
            showNotification('Debes aceptar los Términos y Condiciones para continuar.', 'error');
            return;
        }
    });
});