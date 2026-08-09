import Image from "next/image";

import type { EstateGalleryImage } from "@/src/types/estate";

type EstateGalleryProps = {
  images: EstateGalleryImage[];
};

export function EstateGallery({
  images,
}: EstateGalleryProps) {
  if (images.length === 0) {
    return null;
  }

  const [primary, ...secondary] = images;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="relative min-h-105 overflow-hidden rounded-3xl lg:min-h-155">
        <Image
          src={primary.src}
          alt={primary.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 68vw"
          className="object-cover"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {secondary.slice(0, 3).map((image) => (
          <div
            key={image.src}
            className="relative min-h-55 overflow-hidden rounded-[1.25rem] lg:min-h-0"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 32vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}