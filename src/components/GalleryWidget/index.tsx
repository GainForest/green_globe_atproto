"use client";
import GalleryDialog, { GalleryImage } from "@/components/GalleryDialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import useGalleryWidgetDialogContext, {
  GalleryWidgetDialogProvider,
} from "./context";

const GalleryWidgetDialog = ({ children }: { children: React.ReactNode }) => {
  const {
    images,
    imageInfoContent,
    title,
    description,
    currentImageIndex,
    onImageChange,
  } = useGalleryWidgetDialogContext();

  const currentImageId = images[currentImageIndex].id;
  return (
    <GalleryDialog
      images={images}
      title={title}
      description={description}
      currentImageId={currentImageId}
      trigger={children}
      onChange={onImageChange}
    >
      {imageInfoContent}
    </GalleryDialog>
  );
};

const GalleryWidget = ({
  title,
  subtitle,
  images,
  imageInfoContent,
  currentDialogImageIndex,
  onDialogImageChange,
}: {
  images: Array<GalleryImage>;
  title: string;
  subtitle: React.ReactNode;
  imageInfoContent: React.ReactNode;
  currentDialogImageIndex: number;
  onDialogImageChange: ({
    imageId,
    imageIndex,
  }: {
    imageId: string;
    imageIndex: number;
  }) => void;
}) => {
  return (
    <GalleryWidgetDialogProvider
      title={title}
      description={`View all ${title} images`}
      images={images}
      currentImageIndex={currentDialogImageIndex}
      onImageChange={onDialogImageChange}
      imageInfoContent={imageInfoContent}
    >
      <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted">
        <div className="flex items-start">
          <div className="flex flex-col flex-1">
            <h1 className="font-bold text-lg">{title}</h1>
            <span className="text-sm text-muted-foreground flex items-center">
              {subtitle}
            </span>
          </div>
          {images.length > 4 && (
            <GalleryWidgetDialog>
              <button className="rounded-full px-3 py-1 text-sm flex items-center justify-center bg-neutral-500/70 backdrop-blur-md text-white shadow-sm">
                <b>All</b>
                <ChevronRight size={16} />
              </button>
            </GalleryWidgetDialog>
          )}
        </div>
        <div className="flex items-center justify-start gap-2 rounded-lg">
          {images.slice(0, 4).map((image, index) => (
            <GalleryWidgetDialog key={image.id}>
              <Button
                key={image.id}
                variant={"secondary"}
                className="h-auto flex-1 aspect-square rounded-lg p-0 overflow-hidden"
                onClick={() => {
                  onDialogImageChange({
                    imageId: image.id,
                    imageIndex: index,
                  });
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={100}
                  height={100}
                  className="w-full aspect-square object-cover scale-105 hover:scale-100 transition-all duration-300"
                />
              </Button>
            </GalleryWidgetDialog>
          ))}
        </div>
      </div>
    </GalleryWidgetDialogProvider>
  );
};

export default GalleryWidget;
