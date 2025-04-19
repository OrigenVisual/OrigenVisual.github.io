import { ImageUploader } from "@/components/image-uploader"
import { PageHeader } from "@/components/page-header"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PageHeader
        title="Analizador de Imágenes"
        description="Sube una imagen y obtén información detallada sobre ella, similar a Google Lens."
      />
      <div className="mt-8">
        <ImageUploader />
      </div>
    </main>
  )
}
