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
    // Hacemos la función global para que el `onclick` del HTML la encuentre por ahora.
    // Lo ideal sería manejar el evento 'click' aquí directamente.
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

    // --- Validación de correo electrónico ---
    const emailInput = document.getElementById('correo');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validarCorreo(this.value);
        });
    }

    function validarCorreo(email) {
        const expReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        const esValido = expReg.test(email);
       
        if (email && !esValido) { // Solo muestra la notificación si hay texto y no es válido.
            showNotification("El correo no es válido o ya esta registrado. Por favor, ingrese un correo válido.", 'error');
            // Opcional: enfocar el campo de nuevo
            if (emailInput) {
                emailInput.focus();
            }
        }
    }

    // --- Validación de Contraseña ---
    const passwordInput = document.getElementById('contrasena');
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            const password = this.value;
            if (password && !validarContraseña(password)) {
                showNotification('La contraseña debe tener 8 caracteres, mayúscula, minúscula, número y un símbolo !@#$%^&*._-', 'error');
            }
        });
    }

    function validarContraseña(password) {
        // La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula, un número y un caracter especial.
        const expReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-])[A-Za-z\d!@#$%^&*._-]{8,}$/;
        return expReg.test(password);
    }

    // --- Validación para solo números en celular y documento ---
    const celularInput = document.getElementById('numeroCelular');
    if (celularInput) {
        celularInput.addEventListener('input', function() {
            // Elimina cualquier caracter que no sea un dígito
            this.value = this.value.replace(/\D/g, '');
        });
    }


    // --- Validación para requerir al menos un checkbox ---
    const form = document.getElementById('investorForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            // Validación para 'Etapas de los proyectos'
            const etapasCheckboxes = document.querySelectorAll('input[name="etapas"]');
            const etapaChecked = Array.from(etapasCheckboxes).some(checkbox => checkbox.checked);

            if (!etapaChecked) {
                event.preventDefault();
                showNotification('Por favor, selecciona al menos una etapa de proyecto en la que inviertes.', 'error');
                etapasCheckboxes[0].focus();
                return; // Detiene la validación si esta falla
            }

            // Validación para 'Áreas de interés'
            const areasCheckboxes = document.querySelectorAll('input[name="areas"]');
            const areaChecked = Array.from(areasCheckboxes).some(checkbox => checkbox.checked);

            if (!areaChecked) {
                event.preventDefault();
                showNotification('Por favor, selecciona al menos un área de interés.', 'error');
                areasCheckboxes[0].focus();
            }
        });
    }

    // --- Validación dinámica de Tipo y Número de Documento ---
    const tipoDocumentoSelect = document.getElementById('tipoDocumento');
    const numeroDocumentoInput = document.getElementById('numeroDocumento');

    if (tipoDocumentoSelect && numeroDocumentoInput) {
        // Evento para permitir solo la entrada de números en tiempo real
         numeroDocumentoInput.addEventListener('input', function() {
            const tipo = tipoDocumentoSelect.value;
            // Si no es Pasaporte, solo permite números.
            if (tipo !== 'PAS') {
                // Elimina cualquier caracter que no sea un dígito
                this.value = this.value.replace(/\D/g, '');
            }
         });

        // 1. Cambiar el placeholder y maxlength al seleccionar un tipo de documento
        tipoDocumentoSelect.addEventListener('change', function() {
            const tipo = this.value;
            numeroDocumentoInput.value = ''; // Limpiar el campo al cambiar de tipo

            if (tipo === 'NIT') {
                numeroDocumentoInput.placeholder = 'Ej: 9001234567';
                numeroDocumentoInput.maxLength = 10;
            } else if (tipo === 'CC' || tipo === 'CE') {
                numeroDocumentoInput.placeholder = 'Ej: 1023456789';
                numeroDocumentoInput.maxLength = 10;
            } else if (tipo === 'PAS') {
                numeroDocumentoInput.placeholder = 'Número de Pasaporte';
                numeroDocumentoInput.maxLength = 20;
            } else {
                numeroDocumentoInput.placeholder = 'Número de Documento';
                numeroDocumentoInput.maxLength = 20; // Un valor por defecto
            }
            numeroDocumentoInput.focus(); // Poner el foco en el campo de número
        });

        // 2. Validar el número de documento cuando el usuario sale del campo
        numeroDocumentoInput.addEventListener('blur', function() {
            const tipo = tipoDocumentoSelect.value;
            const numero = this.value;

            if (!numero) return; // No validar si está vacío (el 'required' del HTML se encargará)

            let esValido = false;
            let mensajeError = '';

            if (tipo === 'NIT') {
                // Expresión regular para NIT colombiano: 10 dígitos numéricos.
                esValido = /^\d{10}$/.test(numero); // Valida exactamente 10 dígitos numéricos
                mensajeError = 'El NIT no es válido. Debe contener 10 dígitos sin guiones ni puntos.';
            } else if (tipo === 'CC' || tipo === 'CE') {
                // Cédulas suelen tener entre 7 y 10 dígitos numéricos.
                esValido = /^\d{7,10}$/.test(numero);
                mensajeError = 'El número de documento no es válido. Debe contener entre 7 y 10 dígitos.';
            } else if (tipo === 'PAS') {
                // Pasaportes pueden ser alfanuméricos, validamos que tenga entre 6 y 20 caracteres.
                esValido = /^[A-Za-z0-9]{6,20}$/.test(numero);
                mensajeError = 'El número de pasaporte no es válido. Debe tener entre 6 y 20 caracteres alfanuméricos.';
            }

            if (tipo && !esValido) { // Solo validar si se ha seleccionado un tipo
                showNotification(mensajeError, 'error');
                this.focus();
            }
        });
    }
});