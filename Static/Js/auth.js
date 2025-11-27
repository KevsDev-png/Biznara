/**
 * auth.js con AJAX
 */

let stylesInjected = false;


function injectNotificationStyles() {
    if (stylesInjected) return;
    const style = document.createElement('style');
    style.textContent = `
        .auth-notification {
            position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
            padding: 12px 25px; border-radius: 8px; color: white;
            background-color: #d9534f; /* Error por defecto */
            z-index: 10001; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            opacity: 0; transform: translate(-50%, -20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            font-family: Arial, sans-serif; font-size: 15px;
            max-width: 90%; text-align: center;
        }
        .auth-notification.success { background-color: #5cb85c; }
        .auth-notification.show { opacity: 1; transform: translate(-50%, 0); }
    `;
    document.head.appendChild(style);
    stylesInjected = true;
}

/**
 * Muestra una notificación no bloqueante en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de notificación ('error', 'success').
 */
function showAuthNotification(message, type = 'error') {
    injectNotificationStyles();

    // Remover notificaciones existentes para evitar apilamiento
    document.querySelectorAll('.auth-notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `auth-notification ${type}`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove(), { once: true });
    }, 4000);
}


document.addEventListener('DOMContentLoaded', () => {

    /**
     * Esta función se encarga de la lógica del menú "hamburguesa" en dispositivos móviles.
     */
    function initializeMenuToggle() {
        // Busca en el HTML el botón del menú por su ID 'menu-toggle'.
        const menuToggle = document.getElementById('menu-toggle');
        // Busca en el HTML la lista de navegación por su ID 'nav-menu'.
        const navMenu = document.getElementById('nav-menu');

        // Comprueba si ambos elementos (el botón y el menú) fueron encontrados en la página.
        if (menuToggle && navMenu) {
            // Añade un "escuchador" de eventos al botón. Cuando se le haga clic...
            menuToggle.addEventListener('click', () => {
                // ...añade o quita la clase 'active' al menú. Esto se usa en el CSS
                // para mostrar u ocultar el menú.
                navMenu.classList.toggle('active');
            });
        } else {
            // Si no se encontraron los elementos, muestra un aviso en la consola del navegador.
            console.warn('Elementos del menú no encontrados.');
        }
    }

    /**
     * Esta función maneja todo el proceso de inicio de sesión: desde que el usuario
     * envía el formulario hasta que se le muestra la pantalla de verificación.
     */
    function initializeAuthFlow() {
        // Busca todos los elementos HTML necesarios para el flujo de login por sus IDs.
        const loginForm = document.getElementById('loginForm'); // El formulario de login.
        const loginView = document.getElementById('login-view'); // La sección (vista) del login.
        const verificationView = document.getElementById('verification-view'); // La sección de verificación.
        const backToLoginBtn = document.getElementById('back-to-login-btn'); // El botón para volver al login.
        const emailInput = document.getElementById('login-email'); // El campo para escribir el email.
        const emailDisplay = document.getElementById('verification-email-display'); // Donde se muestra el email ofuscado.
        const verificationForm = document.getElementById('verificationForm');
        
        // Elementos para el flujo de recuperación de contraseña parte del modal de login
        const recoveryView = document.getElementById('recovery-view');
        const forgotPasswordLink = document.getElementById('forgot-password-link');
        const backToLoginFromRecoveryBtn = document.getElementById('back-to-login-from-recovery-btn');
        const recoveryForm = document.getElementById('recoveryForm');
        const recoveryEmailInput = document.getElementById('recovery-email');

        // Comprueba si todos los elementos fueron encontrados. Si falta alguno, detiene la función.
        if (!loginForm || !loginView || !verificationView || !backToLoginBtn || !emailInput || !emailDisplay || !recoveryView || !forgotPasswordLink || !backToLoginFromRecoveryBtn || !verificationForm) {
        }

//verificacion de codigo

        // Añade un "escuchador" al formulario para el evento 'submit' (cuando se intenta enviar).
        loginForm.addEventListener('submit', async (event) => {
            // Previene el comportamiento por defecto del formulario, que es recargar la página.
            event.preventDefault(); 
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Verificando...';

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(loginForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Éxito: el backend envió el código
                    emailDisplay.textContent = result.email;
                    loginView.style.display = 'none';
                    verificationView.style.display = 'block';
                    const firstInput = document.querySelector('.code-input');
                    if (firstInput) firstInput.focus();
                } else {
                    // Error manejado por el backend
                    showAuthNotification(result.message || 'Ocurrió un error.', 'error');
                }
            } catch (error) {
                console.error('Error en la solicitud de login:', error);
                showAuthNotification('Error de conexión con el servidor.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Iniciar sesión';
            }
        });

        // Añade un "escuchador" al botón de "volver atrás".
        backToLoginBtn.addEventListener('click', () => {
            // Oculta la vista de verificación.
            verificationView.style.display = 'none';
            // Muestra de nuevo la vista de inicio de sesión.
            loginView.style.display = 'block';
        });

        // Añade un "escuchador" al enlace de "¿Olvidaste tu contraseña?". parte del modal de login
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Previene que el enlace recargue la página.
            // Oculta la vista de inicio de sesión.
            loginView.style.display = 'none';
            // Muestra la vista de recuperación de contraseña.
            recoveryView.style.display = 'block';
        });

        // Añade un "escuchador" al botón de "volver" en la vista de recuperación.
        backToLoginFromRecoveryBtn.addEventListener('click', () => {
            recoveryView.style.display = 'none'; // Oculta la vista de recuperación.
            loginView.style.display = 'block'; // Muestra la vista de inicio de sesión.
        });

        // Añade un "escuchador" al formulario de recuperación de contraseña.
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', async (event) => {
                event.preventDefault(); // Previene que la página se recargue.
                const submitButton = recoveryForm.querySelector('button[type="submit"]');
                const email = recoveryEmailInput.value;

                // Cambiamos el texto del botón y lo deshabilitamos
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                try {
                    const response = await fetch('/verificador', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: email }),
                    });

                    const result = await response.json();

                    // Usamos la función de notificación que ya tienes
                    showAuthNotification(result.message, result.success ? 'success' : 'error');

                } catch (error) {
                    console.error('Error en la solicitud de recuperación:', error);
                    showAuthNotification('Error de conexión con el servidor.', 'error');
                } finally {
                    // Restauramos el botón a su estado original
                    submitButton.disabled = false;
                    submitButton.textContent = 'Enviar Instrucciones';
                }
            });
        }

        // Añade un "escuchador" al formulario de verificación
        verificationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = verificationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Verificando...';

            const inputs = verificationForm.querySelectorAll('.code-input');
            const code = Array.from(inputs).map(input => input.value).join('');

            try {
                const response = await fetch('/verify_code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: code }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showAuthNotification(result.message, 'success');
                    // Redirigir a la página principal (o a un dashboard) después de un breve retraso
                    setTimeout(() => {
                        window.location.href = '/'; // Cambia esto a la ruta del dashboard si tienes una
                    }, 1500);
                } else {
                    showAuthNotification(result.message || 'Error al verificar el código.', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Verificar e Iniciar Sesión';
                }
            } catch (error) {
                showAuthNotification('Error de conexión al verificar el código.', 'error');
            }
        });
    }

    /**
     * Esta función mejora la experiencia de usuario en los campos del código de verificación,
     * permitiendo que el cursor salte automáticamente al siguiente campo.
     */
    function initializeVerificationInputs() {
        // Selecciona TODOS los campos de entrada que tengan la clase 'code-input'.
        const codeInputs = document.querySelectorAll('.code-input');
        // Si no se encuentra ningún campo, no hace nada y termina la función.
        if (codeInputs.length === 0) return;

        // Recorre cada uno de los campos de entrada encontrados.
        codeInputs.forEach((input, index) => {
            // Añade un "escuchador" para el evento 'input' (cuando el usuario escribe algo).
            input.addEventListener('input', () => {
                // Si el campo ya tiene 1 caracter y NO es el último campo de la lista...
                if (input.value.length === 1 && index < codeInputs.length - 1) {
                    // ...mueve el foco (cursor) al siguiente campo.
                    codeInputs[index + 1].focus();
                }
            });

            // Añade un "escuchador" para el evento 'keydown' (cuando se presiona una tecla).
            input.addEventListener('keydown', (e) => {
                // Si la tecla presionada es 'Backspace' (borrar), el campo está vacío y NO es el primer campo...
                if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
                    // ...mueve el foco (cursor) al campo anterior.
                    codeInputs[index - 1].focus();
                }
            });
        });
    }

    // Finalmente, se llama a las tres funciones de inicialización para que todo empiece a funcionar.
    initializeMenuToggle();
    initializeAuthFlow();
    initializeVerificationInputs();
});
