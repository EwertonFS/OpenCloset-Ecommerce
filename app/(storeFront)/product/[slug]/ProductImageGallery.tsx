'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  selectedImage: string;
  setSelectedImage: (image: string) => void;
}

export function ProductImageGallery({ images, productName, selectedImage, setSelectedImage }: ProductImageGalleryProps) {
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [mobileCurrent, setMobileCurrent] = useState(0);

  const [desktopApi, setDesktopApi] = useState<CarouselApi>();
  const [desktopCurrent, setDesktopCurrent] = useState(0);

  useEffect(() => {
    if (!mobileApi) return;
    setMobileCurrent(mobileApi.selectedScrollSnap());
    mobileApi.on('select', () => {
      const selectedSnap = mobileApi.selectedScrollSnap();
      setMobileCurrent(selectedSnap);
      setSelectedImage(images[selectedSnap]);
    });
  }, [mobileApi, images, setSelectedImage]);

  useEffect(() => {
    if (!desktopApi) return;
    setDesktopCurrent(desktopApi.selectedScrollSnap());
    desktopApi.on('select', () => {
      const selectedSnap = desktopApi.selectedScrollSnap();
      setDesktopCurrent(selectedSnap);
      setSelectedImage(images[selectedSnap]);
    });
  }, [desktopApi, images, setSelectedImage]);

  const handleThumbnailClick = (index: number) => {
    mobileApi?.scrollTo(index);
    desktopApi?.scrollTo(index);
    setSelectedImage(images[index]);
  };

  useEffect(() => {
    const index = images.findIndex(image => image === selectedImage);
    if (index !== -1) {
      mobileApi?.scrollTo(index);
      desktopApi?.scrollTo(index);
    }
  }, [selectedImage, images, mobileApi, desktopApi]);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-5">
        <div className="flex flex-col gap-5">
          {images.map((image, index) => (
            <div
              key={`desktop-thumb-${index}`}
              className={`relative w-[60px] h-[60px] rounded-xl cursor-pointer overflow-hidden border-2 ${desktopCurrent === index ? 'border-amber-300' : 'border-transparent'
                }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
        <div className="relative w-full">
          <Carousel setApi={setDesktopApi} className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={`desktop-main-${index}`}>
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={image}
                      alt={`${productName} image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full">
        <div className="relative">
          <Carousel setApi={setMobileApi} className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={`mobile-main-${index}`}>
                  <div className="relative w-full h-[400px] rounded-2xl overflow-hidden">
                    <Image
                      src={image}
                      alt={`${productName} image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {images.map((image, index) => (
            <div
              key={`mobile-thumb-${index}`}
              className={`relative w-16 h-16 rounded-lg cursor-pointer overflow-hidden border-2 ${mobileCurrent === index ? 'border-amber-300' : 'border-transparent'
                }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
