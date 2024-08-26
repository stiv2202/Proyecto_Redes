// hooks/usePopup.js
import { useState, useCallback } from 'react'; // Importa los hooks useState y useCallback de React.

const usePopup = () => {
  // Estado para almacenar la información de los popups.
  const [popups, setPopups] = useState({});

  // Función para mostrar un popup.
  const showPopup = useCallback((id, content, inputRequired = false, confirmCallback, cancelCallback) => {
    setPopups((prev) => ({
      ...prev, // Mantiene los popups existentes.
      [id]: { // Actualiza o crea un popup con el id proporcionado.
        content, // Contenido del popup.
        isVisible: true, // El popup está visible.
        inputRequired, // Indica si se requiere un campo de entrada.
        inputValue: '', // Valor inicial del campo de entrada.
        onConfirm: confirmCallback, // Función de callback para confirmar.
        onCancel: cancelCallback, // Función de callback para cancelar.
      },
    }));
  }, []); // Dependencias vacías, la función se memoriza y no cambia entre renders.

  // Función para ocultar un popup.
  const hidePopup = useCallback((id) => {
    setPopups((prev) => ({
      ...prev, // Mantiene los popups existentes.
      [id]: { // Actualiza el popup con el id proporcionado.
        ...prev[id], // Conserva la información existente del popup.
        isVisible: false, // El popup se oculta.
      },
    }));
  }, []); // Dependencias vacías, la función se memoriza y no cambia entre renders.

  // Función para manejar la confirmación del popup.
  const handleConfirm = useCallback((id) => {
    if (popups[id]?.onConfirm) popups[id].onConfirm(popups[id].inputValue); // Llama a la función de confirmación con el valor del input si existe.
    hidePopup(id); // Oculta el popup.
  }, [popups, hidePopup]); // Dependencias: popups y hidePopup.

  // Función para manejar la cancelación del popup.
  const handleCancel = useCallback((id) => {
    if (popups[id]?.onCancel) popups[id].onCancel(); // Llama a la función de cancelación si existe.
    hidePopup(id); // Oculta el popup.
  }, [popups, hidePopup]); // Dependencias: popups y hidePopup.

  // Función para manejar el cambio en el valor del campo de entrada del popup.
  const handleInputChange = useCallback((id, value) => {
    setPopups((prev) => ({
      ...prev, // Mantiene los popups existentes.
      [id]: { // Actualiza el popup con el id proporcionado.
        ...prev[id], // Conserva la información existente del popup.
        inputValue: value, // Actualiza el valor del campo de entrada.
      },
    }));
  }, []); // Dependencias vacías, la función se memoriza y no cambia entre renders.

  // Retorna las funciones y el estado del popup para ser utilizados en componentes.
  return {
    popups,
    showPopup,
    handleConfirm,
    handleCancel,
    handleInputChange,
  };
};

export default usePopup; // Exporta el hook usePopup para su uso en otros componentes.
