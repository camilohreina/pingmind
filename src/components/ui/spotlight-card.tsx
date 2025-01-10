import {useRef, useState, ReactNode} from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<{x: number; y: number}>({x: 0, y: 0});
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();

    setPosition({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };

  const handleFocus = (): void => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = (): void => {
    setOpacity(0.6);
  };

  const handleMouseLeave = (): void => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      className={`relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-8 ${className}`}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
