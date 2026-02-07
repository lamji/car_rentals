"use client";

import Image from "next/image";
import { useState } from "react";

interface CarImagesProps {
  imageUrls: string[];
  carName: string;
}

export function CarImages({ imageUrls, carName }: CarImagesProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div data-testid="car-images-section" className="space-y-6">
      <div data-testid="main-car-image" className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-gray-50">
        <Image
          src={imageUrls[selectedImageIndex]}
          alt={carName}
          fill
          className="object-contain"
          priority
        />
      </div>

      {imageUrls.length > 1 && (
        <div data-testid="car-thumbnails" className="flex gap-4 overflow-x-auto pb-2">
          {imageUrls.map((imageUrl, index) => (
            <button
              key={index}
              data-testid={`car-thumbnail-${index}`}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${selectedImageIndex === index
                ? "border-primary shadow-lg"
                : "border-gray-200 opacity-70 hover:opacity-100"
                }`}
            >
              <Image
                src={imageUrl}
                alt={`${carName} thumbnail ${index + 1}`}
                fill
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
