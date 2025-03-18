import { createContext, useContext, useState } from "react";
import { GalleryImage } from "../GalleryDialog";

type GalleryWidgetDialogContextType = {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  title: string;
  description: string;
  images: Array<GalleryImage>;
  currentImageIndex: number;

  onImageChange: ({
    imageId,
    imageIndex,
  }: {
    imageId: string;
    imageIndex: number;
  }) => void;

  imageInfoContent: React.ReactNode;
};

export const GalleryWidgetDialogContext =
  createContext<GalleryWidgetDialogContextType | null>(null);

export const GalleryWidgetDialogProvider = ({
  children,
  images,
  imageInfoContent,
  currentImageIndex,
  onImageChange,
  title,
  description,
}: {
  children: React.ReactNode;
  images: Array<GalleryImage>;
  imageInfoContent: React.ReactNode;
  currentImageIndex: number;
  onImageChange: ({
    imageId,
    imageIndex,
  }: {
    imageId: string;
    imageIndex: number;
  }) => void;
  title: string;
  description: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <GalleryWidgetDialogContext.Provider
      value={{
        isDialogOpen,
        setIsDialogOpen,
        currentImageIndex,
        onImageChange,
        imageInfoContent,
        images,
        title,
        description,
      }}
    >
      {children}
    </GalleryWidgetDialogContext.Provider>
  );
};

const useGalleryWidgetDialogContext = () => {
  const context = useContext(GalleryWidgetDialogContext);
  if (!context) {
    throw new Error(
      "useGalleryWidgetDialogContext must be used within a GalleryWidgetProvider"
    );
  }
  return context;
};

export default useGalleryWidgetDialogContext;
