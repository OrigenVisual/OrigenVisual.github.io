import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    // Convert the image to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const dataURI = `data:${imageFile.type};base64,${base64Image}`

    // Analyze the image using Groq
    const analysisResult = await analyzeImage(dataURI)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Error al procesar la imagen" }, { status: 500 })
  }
}

async function analyzeImage(imageDataUri: string) {
  try {
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

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(text)
      return jsonResponse
    } catch (e) {
      console.error("Error parsing JSON response:", e)
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/) || text.match(/{[\s\S]*?}/)

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
