import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function optimizeImage(url: string | null | undefined, width?: number) {
  if (!url) return ""
  if (!url.includes("res.cloudinary.com")) return url

  // Add quality and format parameters
  // c_limit,w_X: resizes to width X while maintaining aspect ratio
  // f_auto: automatic format (WebP, Avif etc)
  // q_auto: automatic quality optimization
  const params = width ? `c_limit,w_${width},f_auto,q_auto` : 'f_auto,q_auto'

  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/${params}/`)
  }

  return url
}
