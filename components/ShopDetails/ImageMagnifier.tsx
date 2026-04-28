"use client";
import { useState, useRef, MouseEvent } from "react";
import { ZoomIn } from "lucide-react";

interface ImageMagnifierProps {
  src: string;
  alt?: string;
  magnifierSize?: number;
  zoomLevel?: number;
}

const ImageMagnifier = ({
  src,
  alt = "product",
  magnifierSize = 280,
  zoomLevel = 2.5,
}: ImageMagnifierProps) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const getMagnifierStyle = (): React.CSSProperties => {
    if (!imgRef.current || !containerRef.current) return {};

    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const imgOffsetX = imgRect.left - containerRect.left;
    const imgOffsetY = imgRect.top - containerRect.top;

    const imgX = mousePos.x - imgOffsetX;
    const imgY = mousePos.y - imgOffsetY;

    return {
      width: magnifierSize,
      height: magnifierSize,
      left: mousePos.x - magnifierSize / 2,
      top: mousePos.y - magnifierSize / 2,
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${imgRect.width * zoomLevel}px ${imgRect.height * zoomLevel}px`,
      backgroundPositionX: `${magnifierSize / 2 - imgX * zoomLevel}px`,
      backgroundPositionY: `${magnifierSize / 2 - imgY * zoomLevel}px`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative cursor-crosshair select-none bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-8 mb-4 min-h-[400px] flex items-center justify-center border border-slate-200 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="max-w-full h-auto object-contain max-h-[400px]"
        draggable={false}
      />

      {/* Zoom hint shown when not hovering */}
      {!showMagnifier && (
        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm pointer-events-none">
          <ZoomIn className="w-3 h-3" />
          <span>Hover to zoom</span>
        </div>
      )}

      {/* Magnifier lens */}
      {showMagnifier && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_8px_32px_rgba(0,0,0,0.35)]"
          style={getMagnifierStyle()}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
