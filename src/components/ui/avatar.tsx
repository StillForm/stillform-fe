import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 48, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[rgba(207,175,109,0.25)] bg-[rgba(18,18,21,0.8)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}
