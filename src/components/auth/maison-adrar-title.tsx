"use client";

import { cn } from "@/lib/utils";

/**
 * "Maison Adrar" title with staggered character animation,
 * similar to the mobile app (my-app) FancyText: letters come in one by one with a subtle bounce.
 */
export function MaisonAdrarTitle({ className }: { className?: string }) {
  const words = ["Maison", "Adrar"];
  let charIndex = 0;

  return (
    <h1
      className={cn("text-center text-2xl font-light tracking-tight sm:text-3xl", className)}
      aria-label="Maison Adrar"
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block">
          {word.split("").map((char) => {
            const i = charIndex++;
            const delay = i * 45;
            return (
              <span
                key={`${wordIdx}-${i}`}
                className="inline-block animate-fancy-char"
                style={{
                  animationDelay: `${delay}ms`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
          {wordIdx < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </h1>
  );
}
