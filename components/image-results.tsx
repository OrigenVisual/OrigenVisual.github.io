"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Search, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface ImageResultsProps {
  results: {
    objects: {
      name: string
      confidence: number
    }[]
    text: {
      content: string
      translated?: string
    }
    similarImages?: {
      url: string
      title: string
    }[]
    products?: {
      name: string
      price?: string
      url: string
    }[]
    metadata?: {
      [key: string]: string
    }
    visualStyle?: {
      style: string
      similar: string[]
    }
  }
}

export function ImageResults({ results }: ImageResultsProps) {
  const [activeTab, setActiveTab] = useState("objects")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados del análisis</CardTitle>
        <CardDescription>Información detallada sobre la imagen analizada</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="objects" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="objects">Objetos</TabsTrigger>
            <TabsTrigger value="text">Texto</TabsTrigger>
            <TabsTrigger value="search">Búsqueda</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="metadata">Metadatos</TabsTrigger>
            <TabsTrigger value="style">Estilo</TabsTrigger>
          </TabsList>

          <TabsContent value="objects" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {results.objects && results.objects.length > 0 ? (
                results.objects.map((obj, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1">
                    {obj.name} ({Math.round(obj.confidence * 100)}%)
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No se detectaron objetos en la imagen.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text">
            {results.text && results.text.content ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Texto detectado:</h3>
                  <p className="p-3 bg-muted rounded-md">{results.text.content}</p>
                </div>

                {results.text.translated && (
                  <div>
                    <h3 className="font-medium mb-2">Traducción:</h3>
                    <p className="p-3 bg-muted rounded-md">{results.text.translated}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No se detectó texto en la imagen.</p>
            )}
          </TabsContent>

          <TabsContent value="search">
            {results.similarImages && results.similarImages.length > 0 ? (
              <div className="grid gap-4">
                {results.similarImages.map((img, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Search className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <Link
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-center"
                      >
                        {img.title}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No se encontraron imágenes similares.</p>
            )}
          </TabsContent>

          <TabsContent value="products">
            {results.products && results.products.length > 0 ? (
              <div className="grid gap-4">
                {results.products.map((product, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <ShoppingBag className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <Link
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline flex items-center"
                      >
                        {product.name}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                      {product.price && <p className="text-sm text-muted-foreground">{product.price}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No se detectaron productos en la imagen.</p>
            )}
          </TabsContent>

          <TabsContent value="metadata">
            {results.metadata && Object.keys(results.metadata).length > 0 ? (
              <div className="grid gap-2">
                {Object.entries(results.metadata).map(([key, value], index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 py-2 border-b last:border-0">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2">{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No se encontraron metadatos en la imagen.</p>
            )}
          </TabsContent>

          <TabsContent value="style">
            {results.visualStyle ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Estilo detectado:</h3>
                  <Badge variant="outline" className="text-sm py-1">
                    {results.visualStyle.style}
                  </Badge>
                </div>

                {results.visualStyle.similar && results.visualStyle.similar.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Estilos similares:</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.visualStyle.similar.map((style, index) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No se detectó un estilo visual específico.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
