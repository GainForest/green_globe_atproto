"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import autoAnimate from "@formkit/auto-animate";
import { AnimatePresence, motion } from "framer-motion";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

const InfoPanel = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <motion.div
      className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-4 relative overflow-y-auto max-h-[calc(50vh)] w-[300px]"
      initial={{ opacity: 0, x: 10, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 10, filter: "blur(10px)" }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <button
        className="absolute top-2 right-2 rounded-full p-2 flex items-center justify-center bg-neutral-800/70 backdrop-blur-lg text-white shadow-sm"
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

const THUMBNAIL_GAP = 8;
const GalleryDialog = ({
  title,
  description,
  trigger,
  children,
  images,
  currentImageId,
  onChange,
}: {
  title: string;
  description: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  images: GalleryImage[];
  currentImageId: string;
  onChange?: ({
    imageId,
    imageIndex,
  }: {
    imageId: string;
    imageIndex: number;
  }) => void;
}) => {
  const currentImageIndex = images.findIndex(
    (image) => image.id === currentImageId
  );
  const setCurrentImageIndex = (index: number) => {
    onChange?.({
      imageId: images[index].id,
      imageIndex: index,
    });
  };
  const currentImage = images[currentImageIndex];

  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const mainAreaRef = useRef<HTMLDivElement>(null);

  // Add refs for the scroll container and thumbnail buttons
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Set up the refs array for thumbnails
  thumbnailRefs.current = Array(images.length).fill(null);

  // Track dialog open state
  const [isOpen, setIsOpen] = useState(false);

  // Apply centering when dialog opens or current image changes
  useEffect(() => {
    if (!isOpen) return;

    // Use a small timeout to ensure the dialog is fully rendered
    const timeoutId = setTimeout(() => {
      const scrollContainer = scrollContainerRef.current;
      const currentThumbnail = thumbnailRefs.current[currentImageIndex];

      if (scrollContainer && currentThumbnail) {
        // Get the spacer elements
        const startSpacer = scrollContainer.querySelector(
          '[data-spacer="start"]'
        ) as HTMLElement;
        const endSpacer = scrollContainer.querySelector(
          '[data-spacer="end"]'
        ) as HTMLElement;

        if (startSpacer && endSpacer) {
          const containerWidth = scrollContainer.clientWidth;
          const halfContainerWidth = containerWidth / 2;

          // Set width of spacers to half container width
          startSpacer.style.minWidth = `${halfContainerWidth}px`;
          endSpacer.style.minWidth = `${halfContainerWidth}px`;

          // Calculate thumbnail width
          const thumbnailWidth = currentThumbnail.offsetWidth;

          // Calculate the scroll position to center the thumbnail
          const scrollPosition =
            THUMBNAIL_GAP * 0.5 +
            (THUMBNAIL_GAP + thumbnailWidth) * (currentImageIndex + 0.5);

          // Set initial scroll position immediately without animation
          scrollContainer.scrollLeft = scrollPosition;
        }
      }
    }, 50); // Small delay to ensure rendering is complete

    return () => clearTimeout(timeoutId);
  }, [isOpen, currentImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentImageIndex < images.length - 1
      ) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    if (mainAreaRef.current) {
      autoAnimate(mainAreaRef.current);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <motion.div
          className={cn("w-full grid gap-4")}
          animate={{
            gridTemplateColumns: isInfoOpen ? "1fr 300px" : "1fr 0px",
          }}
        >
          <div className="w-full flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
              disabled={currentImageIndex === 0}
              onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <div
              className="h-[calc(50vh)] w-auto flex flex-col items-center justify-center gap-4 p-4"
              ref={mainAreaRef}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1000}
                height={1000}
                className="h-auto w-auto max-h-full max-w-full rounded-xl bg-foreground/10"
              />
              {!isInfoOpen && (
                <button
                  className="rounded-full px-3 py-1 text-sm flex items-center justify-center gap-2 bg-neutral-700/50 backdrop-blur-md text-white shadow-sm"
                  onClick={() => setIsInfoOpen(true)}
                >
                  <Info size={16} />
                  <b>Info</b>
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shrink-0"
              disabled={currentImageIndex === images.length - 1}
              onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          <AnimatePresence mode="popLayout">
            {isInfoOpen && (
              <InfoPanel onClose={() => setIsInfoOpen(false)}>
                {children}
              </InfoPanel>
            )}
          </AnimatePresence>
        </motion.div>
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-scroll py-2 scroll-smooth"
          data-gallery-scroll-container
        >
          <div
            className="flex items-center"
            style={{
              gap: `${THUMBNAIL_GAP}px`,
            }}
          >
            <div data-spacer="start" className="shrink-0 h-20"></div>
            {images.map((image, index) => (
              <button
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                data-gallery-image-id={image.id}
                onClick={() => {
                  setCurrentImageIndex(index);
                }}
                key={image.id}
                className={cn(
                  "h-20 aspect-square rounded-lg bg-foreground/10 shrink-0 transition-all duration-200",
                  currentImage.id === image.id
                    ? "opacity-100 ring ring-ring"
                    : "opacity-50 hover:opacity-80"
                )}
              >
                <Image
                  key={image.id}
                  src={image.src}
                  alt={image.alt}
                  width={100}
                  height={100}
                  className={cn(
                    "h-20 aspect-square rounded-lg object-cover object-center brightness-50"
                  )}
                />
              </button>
            ))}
            <div data-spacer="end" className="shrink-0 h-20"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryDialog;
