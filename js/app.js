document.addEventListener("DOMContentLoaded", () => {
  const uploadContainer = document.getElementById("upload-container")
  const fileUpload = document.getElementById("file-upload")
  const uploadSection = document.getElementById("upload-section")
  const previewSection = document.getElementById("preview-section")
  const imagePreview = document.getElementById("image-preview")
  const changeImageBtn = document.getElementById("change-image")
  const analyzeImageBtn = document.getElementById("analyze-image")
  const loadingSection = document.getElementById("loading-section")
  const resultsSection = document.getElementById("results-section")

  // Settings modal elements
  const settingsButton = document.getElementById("settings-button")
  const settingsModal = document.getElementById("settings-modal")
  const closeSettings = document.getElementById("close-settings")
  const apiKeyInput = document.getElementById("api-key-input")
  const saveApiKey = document.getElementById("save-api-key")
  const clearApiKey = document.getElementById("clear-api-key")
  const modelSelect = document.getElementById("model-select")
  const saveSettings = document.getElementById("save-settings")

  // Tabs
  const tabs = document.querySelectorAll(".tab")
  const tabContents = document.querySelectorAll(".tab-content")

  // Initialize settings
  initializeSettings()

  // Handle file upload
  uploadContainer.addEventListener("click", () => {
    fileUpload.click()
  })

  uploadContainer.addEventListener("dragover", function (e) {
    e.preventDefault()
    this.style.backgroundColor = "var(--background-alt)"
  })

  uploadContainer.addEventListener("dragleave", function () {
    this.style.backgroundColor = ""
  })

  uploadContainer.addEventListener("drop", function (e) {
    e.preventDefault()
    this.style.backgroundColor = ""

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  })

  fileUpload.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      handleFile(this.files[0])
    }
  })

  changeImageBtn.addEventListener("click", () => {
    resetUI()
  })

  analyzeImageBtn.addEventListener("click", () => {
    analyzeImage()
  })

  // Settings modal
  settingsButton.addEventListener("click", () => {
    settingsModal.classList.remove("hidden")

    // Set current values
    apiKeyInput.value = localStorage.getItem("groq_api_key") || ""
    modelSelect.value = getPreferredModel()
  })

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden")
  })

  saveApiKey.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim()
    if (apiKey) {
      localStorage.setItem("groq_api_key", apiKey)
      alert("API key guardada correctamente")
    } else {
      alert("Por favor, ingresa una API key válida")
    }
  })

  clearApiKey.addEventListener("click", () => {
    localStorage.removeItem("groq_api_key")
    apiKeyInput.value = ""
    alert("API key eliminada correctamente")
  })

  saveSettings.addEventListener("click", () => {
    // Save model preference
    savePreferredModel(modelSelect.value)

    // Close modal
    settingsModal.classList.add("hidden")

    alert("Configuración guardada correctamente")
  })

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      tabs.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      this.classList.add("active")
      document.getElementById(`${tabId}-content`).classList.add("active")
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden")
    }
  })

  function initializeSettings() {
    // Set the model select value
    modelSelect.value = getPreferredModel()

    // Populate model options
    for (const [value, label] of Object.entries(AVAILABLE_MODELS)) {
      const option = document.createElement("option")
      option.value = value
      option.textContent = label
      modelSelect.appendChild(option)
    }
  }

  function handleFile(file) {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Por favor, sube una imagen (JPG, PNG, etc.)")
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("El tamaño máximo permitido es 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.src = e.target.result
      uploadSection.classList.add("hidden")
      previewSection.classList.remove("hidden")
      resultsSection.classList.add("hidden")
    }
    reader.readAsDataURL(file)
  }

  function analyzeImage() {
    // Check if API key is set
    if (!localStorage.getItem("groq_api_key")) {
      alert(
        "Se requiere una API key de Groq para analizar imágenes. Por favor, configúrala en la sección de configuración.",
      )
      settingsModal.classList.remove("hidden")
      return
    }

    // Show loading
    previewSection.classList.add("hidden")
    loadingSection.classList.remove("hidden")

    // Get the image data
    const imageData = imagePreview.src

    // Call the Groq API to analyze the image
    analyzeImageWithGroq(imageData)
      .then((results) => {
        // Hide loading
        loadingSection.classList.add("hidden")

        // Show results
        displayResults(results)
        resultsSection.classList.remove("hidden")
      })
      .catch((error) => {
        console.error("Error analyzing image:", error)
        loadingSection.classList.add("hidden")
        alert("Error al analizar la imagen: " + error.message)
        previewSection.classList.remove("hidden")
      })
  }

  async function analyzeImageWithGroq(imageDataUri) {
    try {
      // Prepare the prompt for Groq
      const prompt = `
      Analiza detalladamente esta imagen y proporciona la siguiente información en formato JSON:

      1. Objetos: Identifica los principales objetos, personas o elementos en la imagen con un nivel de confianza estimado.
      2. Texto: Extrae cualquier texto visible en la imagen. Si detectas que está en un idioma diferente al español, proporciona una traducción.
      3. Búsqueda: Sugiere posibles términos de búsqueda para encontrar imágenes similares.
      4. Productos: Si hay productos comerciales visibles, identifícalos con nombres y posibles precios estimados.
      5. Metadatos: Infiere posibles metadatos como ubicación, época, contexto, etc.
      6. Estilo Visual: Identifica el estilo visual si es relevante (arte, moda, arquitectura, etc.)

      La imagen es: ${imageDataUri}

      Responde ÚNICAMENTE con un objeto JSON válido que contenga estos campos, sin texto adicional.
      `

      // Call the Groq API
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("groq_api_key")}`,
        },
        body: JSON.stringify({
          model: getPreferredModel(),
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error: ${errorData.error?.message || response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      // Parse the JSON response
      try {
        return JSON.parse(content)
      } catch (e) {
        console.error("Error parsing JSON response:", e)

        // Try to extract JSON from the text
        const jsonMatch =
          content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || content.match(/{[\s\S]*?}/)

        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1])
          } catch (e) {
            console.error("Error parsing extracted JSON:", e)
          }
        }

        // Return a fallback response
        return {
          objects: [],
          text: { content: "" },
          similarImages: [],
          products: [],
          metadata: {},
          visualStyle: null,
        }
      }
    } catch (error) {
      console.error("Error in image analysis:", error)
      throw error
    }
  }

  function resetUI() {
    uploadSection.classList.remove("hidden")
    previewSection.classList.add("hidden")
    resultsSection.classList.add("hidden")
    fileUpload.value = ""
  }

  function displayResults(results) {
    // Objects
    const objectsList = document.getElementById("objects-list")
    objectsList.innerHTML = ""

    if (results.objects && results.objects.length > 0) {
      results.objects.forEach((obj) => {
        const badge = document.createElement("span")
        badge.className = "badge"
        badge.textContent = `${obj.name} (${Math.round(obj.confidence * 100)}%)`
        objectsList.appendChild(badge)
      })
    } else {
      objectsList.innerHTML = "<p>No se detectaron objetos en la imagen.</p>"
    }

    // Text
    const textDetected = document.getElementById("text-detected")
    textDetected.innerHTML = ""

    if (results.text && results.text.content) {
      const textDiv = document.createElement("div")
      textDiv.innerHTML = `
                <h3>Texto detectado:</h3>
                <div class="text-block">${results.text.content}</div>
            `
      textDetected.appendChild(textDiv)

      if (results.text.translated) {
        const translationDiv = document.createElement("div")
        translationDiv.innerHTML = `
                    <h3>Traducción:</h3>
                    <div class="text-block">${results.text.translated}</div>
                `
        textDetected.appendChild(translationDiv)
      }
    } else {
      textDetected.innerHTML = "<p>No se detectó texto en la imagen.</p>"
    }

    // Search
    const searchResults = document.getElementById("search-results")
    searchResults.innerHTML = ""

    if (results.similarImages && results.similarImages.length > 0) {
      results.similarImages.forEach((img) => {
        const searchItem = document.createElement("div")
        searchItem.className = "search-item"
        searchItem.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <div>
                        <a href="https://www.google.com/search?q=${encodeURIComponent(img.title)}&tbm=isch" target="_blank" rel="noopener noreferrer" class="flex-link">
                            ${img.title}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 0.25rem;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </div>
                `
        searchResults.appendChild(searchItem)
      })
    } else {
      searchResults.innerHTML = "<p>No se encontraron imágenes similares.</p>"
    }

    // Products
    const productsList = document.getElementById("products-list")
    productsList.innerHTML = ""

    if (results.products && results.products.length > 0) {
      results.products.forEach((product) => {
        const productItem = document.createElement("div")
        productItem.className = "product-item"
        productItem.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <div>
                        <a href="https://www.google.com/search?q=${encodeURIComponent(product.name)}" target="_blank" rel="noopener noreferrer" class="flex-link">
                            ${product.name}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 0.25rem;">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                        ${product.price ? `<p class="text-light">${product.price}</p>` : ""}
                    </div>
                `
        productsList.appendChild(productItem)
      })
    } else {
      productsList.innerHTML = "<p>No se detectaron productos en la imagen.</p>"
    }

    // Metadata
    const metadataList = document.getElementById("metadata-list")
    metadataList.innerHTML = ""

    if (results.metadata && Object.keys(results.metadata).length > 0) {
      const table = document.createElement("table")
      table.className = "metadata-table"

      Object.entries(results.metadata).forEach(([key, value]) => {
        const row = document.createElement("tr")
        row.innerHTML = `
                    <td>${key}</td>
                    <td>${value}</td>
                `
        table.appendChild(row)
      })

      metadataList.appendChild(table)
    } else {
      metadataList.innerHTML = "<p>No se encontraron metadatos en la imagen.</p>"
    }

    // Style
    const styleInfo = document.getElementById("style-info")
    styleInfo.innerHTML = ""

    if (results.visualStyle) {
      const styleDiv = document.createElement("div")
      styleDiv.innerHTML = `
                <h3>Estilo detectado:</h3>
                <span class="badge">${results.visualStyle.style}</span>
            `
      styleInfo.appendChild(styleDiv)

      if (results.visualStyle.similar && results.visualStyle.similar.length > 0) {
        const similarDiv = document.createElement("div")
        similarDiv.innerHTML = "<h3>Estilos similares:</h3>"

        const badgesDiv = document.createElement("div")
        badgesDiv.style.display = "flex"
        badgesDiv.style.flexWrap = "wrap"
        badgesDiv.style.gap = "0.5rem"

        results.visualStyle.similar.forEach((style) => {
          const badge = document.createElement("span")
          badge.className = "badge"
          badge.textContent = style
          badgesDiv.appendChild(badge)
        })

        similarDiv.appendChild(badgesDiv)
        styleInfo.appendChild(similarDiv)
      }
    } else {
      styleInfo.innerHTML = "<p>No se detectó un estilo visual específico.</p>"
    }
  }

  const AVAILABLE_MODELS = {
    "llama3-70b-8192": "Llama 3 70B",
    "mixtral-8x22b-32768": "Mixtral 8x22B",
  }

  function getPreferredModel() {
    return localStorage.getItem("preferred_model") || "llama3-70b-8192"
  }

  function savePreferredModel(model) {
    localStorage.setItem("preferred_model", model)
  }
})
