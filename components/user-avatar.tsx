"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const AVATAR_PLACEHOLDER = "/avatar-placeholder.svg";

const sizes = {
  sm: "size-7",
  md: "size-10",
  lg: "size-16",
  xl: "size-24",
} as const;

export function UserAvatar({
  src,
  alt = "Profile photo",
  size = "md",
  className,
}: {
  src?: string | null;
  alt?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url = !failed && src?.trim() ? src.trim() : AVATAR_PLACEHOLDER;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 rounded-full object-cover ring-1 ring-emerald-100 bg-emerald-50",
        sizes[size],
        className,
      )}
    />
  );
}
