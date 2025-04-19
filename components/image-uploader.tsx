"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon } from "lucide-react"
import Image from "next/image"
import { ImageResults } from "./image-results"

export function ImageUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      handleFile(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      handleFile(selectedFile)
    }
  }, [])

  const handleFile = (selectedFile: File) => {
    // Check if file is an image
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, sube una imagen (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    const imageUrl = URL.createObjectURL(selectedFile)
    setImage(imageUrl)
    setResults(null)
  }

  const analyzeImage = async () => {
    if (!file) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al analizar la imagen")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al analizar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetImage = () => {
    setImage(null)
    setFile(null)
    setResults(null)
    if (image) {
      URL.revokeObjectURL(image)
    }
  }

  return (
    <div className="space-y-6">
      {!image ? (
        <Card>
          <CardContent className="p-6">
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="bg-muted rounded-full p-3">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mt-2">Sube una imagen</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra y suelta una imagen aquí o haz clic para seleccionar
                </p>
                <Button variant="secondary" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imagen
                </Button>
              </div>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md mx-auto aspect-square mb-4">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Imagen subida"
                    fill
                    className="object-contain rounded-md"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={resetImage} variant="outline">
                    Cambiar imagen
                  </Button>
                  <Button onClick={analyzeImage} disabled={isAnalyzing}>
                    {isAnalyzing ? "Analizando..." : "Analizar imagen"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {results && <ImageResults results={results} />}
        </div>
      )}
    </div>
  )
}
