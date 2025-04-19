// Configuración de la aplicación

// Función para obtener la API key de Groq
function getGroqApiKey() {
  // En una aplicación real, nunca deberías exponer tu API key en el frontend
  // Esta es solo una implementación de ejemplo
  // Idealmente, deberías usar un backend seguro para manejar las llamadas a la API

  // Puedes almacenar temporalmente la API key en localStorage después de que el usuario la ingrese
  const apiKey = localStorage.getItem("groq_api_key")

  if (!apiKey) {
    const userApiKey = prompt("Por favor, ingresa tu API key de Groq para analizar imágenes:")
    if (userApiKey) {
      localStorage.setItem("groq_api_key", userApiKey)
      return userApiKey
    } else {
      throw new Error("Se requiere una API key de Groq para analizar imágenes")
    }
  }

  return apiKey
}

// Función para limpiar la API key almacenada
function clearApiKey() {
  localStorage.removeItem("groq_api_key")
  alert("API key eliminada correctamente")
}

// Configuración de modelos disponibles
const AVAILABLE_MODELS = {
  "llama3-70b-8192": "Llama 3 70B (Recomendado para análisis detallado)",
  "llama3-8b-8192": "Llama 3 8B (Más rápido, menos detallado)",
}

// Obtener el modelo preferido o usar el predeterminado
function getPreferredModel() {
  return localStorage.getItem("preferred_model") || "llama3-70b-8192"
}

// Guardar el modelo preferido
function savePreferredModel(model) {
  localStorage.setItem("preferred_model", model)
}
