"use client";
import { useEffect, useState } from "react";

export function TypedWord() {
  const [word, setWord] = useState("design");
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const words = ["design", "writing", "code", "your work"];
    let index = 0,
      text = words[0],
      deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      if (media.matches) {
        setWord("your work");
        return;
      }
      if (deleting) text = text.slice(0, -1);
      else text = words[index].slice(0, text.length + 1);
      setWord(text);
      let delay = deleting ? 65 : 110;
      if (!text) {
        deleting = false;
        index = (index + 1) % words.length;
        delay = 200;
      } else if (text === words[index] && !deleting) {
        deleting = true;
        delay = 2400;
      }
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 2400);
    return () => clearTimeout(timer);
  }, []);
  return (
    <span className="typed-word">
      <span className="sr-only">your work</span>
      <span aria-hidden="true">
        {word}
        <span className="type-caret" />
      </span>
    </span>
  );
}

/** A moving settlement path, drawn with CSS rather than a heavy 3D runtime. */
export function SettlementObject({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`settlement-object ${compact ? "compact" : ""}`}
      aria-hidden="true"
    >
      <div className="object-grid" />
      <div className="orbital orbital-one" />
      <div className="orbital orbital-two" />
      <div className="orbital orbital-three" />
      <div className="settlement-core">
        <span>$</span>
        <small>USDC</small>
      </div>
      <span className="orbit-label label-sol">SOL</span>
      <span className="orbit-label label-eth">ETH</span>
      <span className="orbit-label label-usdt">USDT</span>
      <span className="orbit-note">MANY TOKENS. ONE DESTINATION.</span>
    </div>
  );
}
