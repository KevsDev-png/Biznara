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

    // --- LÓGICA PARA CAMPOS CONDICIONALES DE TIPO DE CONTRIBUYENTE ---
    const radiosContribuyente = document.querySelectorAll('input[name="tipo_contribuyente"]');
    const naturalWrapper = document.getElementById('conditional-natural-wrapper');
    const inputDocumentoNatural = document.getElementById('numero-documento');
    const juridicaWrapper = document.getElementById('conditional-juridica-wrapper');
    const inputNitJuridica = document.getElementById('nit');

    radiosContribuyente.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'natural') {
                // Muestra campo Natural, lo hace requerido
                naturalWrapper.classList.remove('hidden');
                inputDocumentoNatural.required = true;

                // Oculta campo Jurídica, quita el required y limpia el valor
                juridicaWrapper.classList.add('hidden');
                inputNitJuridica.required = false;
                inputNitJuridica.value = '';
            } else if (this.value === 'juridica') {
                // Muestra campo Jurídica, lo hace requerido
                juridicaWrapper.classList.remove('hidden');
                inputNitJuridica.required = true;

                // Oculta campo Natural, quita el required y limpia el valor
                naturalWrapper.classList.add('hidden');
                inputDocumentoNatural.required = false;
                inputDocumentoNatural.value = '';
            }
        });
    });

    // --- Funcionalidad para mostrar/ocultar contraseña ---
    // Hacemos la función global para que el `onclick` del HTML la encuentre.
    window.togglePassword = function() {
        const passwordInput = document.getElementById('contrasena');
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

    // --- VALIDACIONES DE CAMPOS ---

    const form = document.getElementById('registro-form');
    if (!form) return;

    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasena');
    const celularInput = document.querySelector('input[name="numero_celular"]'); // Ajustado para usar name
    const nitInput = document.getElementById('nit');
    const docPersonalInput = document.querySelector('input[name="numero_documento_personal"]');
    const docContribuyenteInput = document.getElementById('numero-documento');

    // Permitir solo números en campos numéricos
    [celularInput, nitInput, docPersonalInput, docContribuyenteInput].forEach(input => {
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

    // Validación de NIT al salir del campo
    if (nitInput) {
        nitInput.addEventListener('blur', () => {
            const nitRegex = /^\d{10}$/;
            if (nitInput.value && !nitRegex.test(nitInput.value)) {
                showNotification('El NIT debe contener exactamente 10 dígitos numéricos.', 'error');
            }
        });
    }

    // --- VALIDACIÓN FINAL AL ENVIAR EL FORMULARIO ---
    form.addEventListener('submit', function(event) {
        const requiredTextFields = [
            'nombre_completo', 'correo', 'contrasena', 'numero_documento_personal', 
            'numero_celular', 'nombre_empresa'
        ];
        const requiredSelects = [
            'tipo_documento_personal', 'sector_produccion', 
            'sector_transformacion', 'sector_comercializacion'
        ];

        // Validar campos de texto requeridos
        for (const name of requiredTextFields) {
            const field = form.querySelector(`[name="${name}"]`);
            if (field && field.value.trim() === '') {
                event.preventDefault();
                showNotification(`El campo "${field.placeholder || name.replace(/_/g, ' ')}" no puede estar vacío.`, 'error');
                field.focus();
                return;
            }
        }

        // Validar selects requeridos
        for (const name of requiredSelects) {
            const field = form.querySelector(`[name="${name}"]`);
            if (field && field.value === '') {
                event.preventDefault();
                showNotification(`Debes seleccionar una opción para "${name.replace(/_/g, ' ')}".`, 'error');
                field.focus();
                return;
            }
        }

        // Validar celular
        if (celularInput.value.length !== 10) {
            event.preventDefault();
            showNotification('El número de celular debe tener exactamente 10 dígitos.', 'error');
            celularInput.focus();
            return;
        }

        // Validar tipo de contribuyente y su campo correspondiente
        const tipoContribuyente = form.querySelector('input[name="tipo_contribuyente"]:checked');
        if (!tipoContribuyente) {
            event.preventDefault();
            showNotification('Debes seleccionar un tipo de contribuyente.', 'error');
            return;
        } else if (tipoContribuyente.value === 'juridica' && nitInput.required && !/^\d{10}$/.test(nitInput.value)) {
            event.preventDefault();
            showNotification('El NIT para Persona Jurídica debe tener 10 dígitos.', 'error');
            nitInput.focus();
            return;
        }

        // Validar tamaño de la empresa
        if (!form.querySelector('input[name="tamano"]:checked')) {
            event.preventDefault();
            showNotification('Debes seleccionar el tamaño de la empresa.', 'error');
            return;
        }

        // Validar términos y condiciones
        if (!document.getElementById('terminos').checked) {
            event.preventDefault();
            showNotification('Debes aceptar los Términos y Condiciones para continuar.', 'error');
            return;
        }
    });
});