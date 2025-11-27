// Espera a que todo el contenido de la página se cargue
document.addEventListener('DOMContentLoaded', function() {

    // 1. Selecciona los elementos del DOM que necesitamos
    const tipoDocumentoSelect = document.getElementById('tipo_documento');
    const numeroDocumentoWrapper = document.getElementById('numero_documento_wrapper');

    // 2. Escucha el evento 'change' en el selector de tipo de documento
    tipoDocumentoSelect.addEventListener('change', function() {
        
        // 3. Comprueba si el usuario ha seleccionado una opción válida (no la primera que está deshabilitada)
        if (tipoDocumentoSelect.value) {
            // Si seleccionó algo, muestra el campo para el número de documento
            numeroDocumentoWrapper.classList.remove('hidden');
        } else {
            // Si no, asegúrate de que el campo esté oculto
            numeroDocumentoWrapper.classList.add('hidden');
        }
    });

});