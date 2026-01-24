import { useState, useEffect } from "react";

export const useBackgroundImage = (src: string | null) => {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setBgImage(null);
      return;
    }

    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      if (isMounted) setBgImage(img);
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return bgImage;
};
