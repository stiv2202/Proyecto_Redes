import { useSnackbar } from "notistack"; // Importa el hook useSnackbar de la librería notistack para mostrar notificaciones.

export default function useNotifications() {
    // Usa el hook useSnackbar para obtener las funciones enqueueSnackbar y closeSnackbar.
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // Función para mostrar una notificación.
    function displayNotification(
        message, // Mensaje de la notificación.
        variant = 'default', // Variante de la notificación (por defecto 'default').
        config = {} // Configuración adicional para la notificación.
    ) {
        // Configuración por defecto para la notificación.
        const defaultConfig = {
            variant, // Tipo de variante (default, success, error, info, warning).
            autoHideDuration: 5000, // La notificación se cierra automáticamente después de 10 segundos.
            anchorOrigin: {
                vertical: 'bottom', // Posición vertical de la notificación.
                horizontal: 'right', // Posición horizontal de la notificación.
            },
            action: (key) => (
                <button
                    aria-label="close" // Etiqueta accesible para lectores de pantalla.
                    color="inherit" // Color del botón.
                    onClick={() => closeSnackbar(key)} // Función para cerrar la notificación.
                >
                    close
                </button>
            ),
        };

        // Combina la configuración por defecto con la configuración proporcionada por el usuario.
        const finalConfig = {
            ...defaultConfig,
            ...config,
        };

        // Muestra la notificación usando enqueueSnackbar.
        enqueueSnackbar(message, finalConfig);
    }

    // Función para cerrar una notificación específica.
    function closeNotification(key = undefined) {
        closeSnackbar(key);
    }

    // Retorna las funciones displayNotification y closeNotification para ser usadas en otros componentes.
    return {
        displayNotification,
        closeNotification,
    };
}
