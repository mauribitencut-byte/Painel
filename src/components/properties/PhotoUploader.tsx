import { useCallback, useState } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUploadPhoto, useDeletePhoto, useSetCoverPhoto } from "@/hooks/usePropertyPhotos";
import { toast } from "sonner";

interface PhotoFile {
  id?: string;
  file?: File;
  url: string;
  is_cover: boolean;
  uploading?: boolean;
}

interface PhotoUploaderProps {
  propertyId?: string;
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  propertyId,
  photos,
  onPhotosChange,
  maxPhotos = 10,
}: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const setCoverPhoto = useSetCoverPhoto();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} é maior que 5MB`);
          return false;
        }
        return true;
      });

      const remainingSlots = maxPhotos - photos.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);

      if (validFiles.length > remainingSlots) {
        toast.warning(`Apenas ${remainingSlots} fotos podem ser adicionadas`);
      }

      // If we have a propertyId, upload directly
      if (propertyId) {
        for (const file of filesToAdd) {
          const tempUrl = URL.createObjectURL(file);
          const tempPhoto: PhotoFile = {
            file,
            url: tempUrl,
            is_cover: photos.length === 0,
            uploading: true,
          };

          onPhotosChange([...photos, tempPhoto]);

          try {
            await uploadPhoto.mutateAsync({
              file,
              propertyId,
              isCover: photos.length === 0,
              orderIndex: photos.length,
            });
            toast.success("Foto enviada com sucesso");
          } catch {
            toast.error("Erro ao enviar foto");
            onPhotosChange(photos.filter((p) => p.url !== tempUrl));
          }
        }
      } else {
        // Store files locally until property is created
        const newPhotos = filesToAdd.map((file, index) => ({
          file,
          url: URL.createObjectURL(file),
          is_cover: photos.length === 0 && index === 0,
        }));
        onPhotosChange([...photos, ...newPhotos]);
      }
    },
    [photos, maxPhotos, propertyId, onPhotosChange, uploadPhoto]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleRemove = useCallback(
    async (photo: PhotoFile, index: number) => {
      if (photo.id && propertyId) {
        try {
          await deletePhoto.mutateAsync({
            id: photo.id,
            property_id: propertyId,
            url: photo.url,
            is_cover: photo.is_cover,
            order_index: index,
            created_at: new Date().toISOString(),
            title: null,
          });
          toast.success("Foto removida");
        } catch {
          toast.error("Erro ao remover foto");
        }
      } else {
        URL.revokeObjectURL(photo.url);
        const newPhotos = photos.filter((_, i) => i !== index);
        // If removed photo was cover, set first photo as cover
        if (photo.is_cover && newPhotos.length > 0) {
          newPhotos[0].is_cover = true;
        }
        onPhotosChange(newPhotos);
      }
    },
    [photos, propertyId, deletePhoto, onPhotosChange]
  );

  const handleSetCover = useCallback(
    async (photo: PhotoFile, index: number) => {
      if (photo.id && propertyId) {
        try {
          await setCoverPhoto.mutateAsync({
            photoId: photo.id,
            propertyId,
          });
          toast.success("Foto de capa definida");
        } catch {
          toast.error("Erro ao definir capa");
        }
      } else {
        const newPhotos = photos.map((p, i) => ({
          ...p,
          is_cover: i === index,
        }));
        onPhotosChange(newPhotos);
      }
    },
    [photos, propertyId, setCoverPhoto, onPhotosChange]
  );

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          photos.length >= maxPhotos && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("photo-input")?.click()}
      >
        <input
          id="photo-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
          disabled={photos.length >= maxPhotos}
        />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Arraste fotos ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground">
          {photos.length}/{maxPhotos} fotos (máx. 5MB cada)
        </p>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id || photo.url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Uploading overlay */}
              {photo.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              {/* Cover badge */}
              {photo.is_cover && (
                <div className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Capa
                </div>
              )}

              {/* Actions */}
              {!photo.uploading && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!photo.is_cover && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(photo, index);
                      }}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(photo, index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
