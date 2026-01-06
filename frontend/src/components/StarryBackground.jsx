import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

function R(max) {
  return Math.random() * max;
}

export default function StarryBackground({ total = 30 }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dots = [];

    const animate = (el) => {
      return gsap.to(el, {
        duration: R(20) + 10,
        x: R(w),
        y: R(h),
        opacity: R(1) + 0.3,
        scale: R(1) + 0.5,
        ease: "none",
        onComplete: () => animate(el),
      });
    };

    for (let i = 0; i < total; i++) {
      const dot = document.createElement("div");
      dot.className = "firefly-dot";

      gsap.set(dot, {
        x: R(w),
        y: R(h),
        opacity: 1, // FORCE VISIBILITY
        scale: 1,
      });

      container.appendChild(dot);
      dots.push(animate(dot));
    }


    return () => {
      dots.forEach((d) => d.kill());
      container.innerHTML = "";
    };
  }, [total]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "#29304fff",
      }}
    >
      <style>
        {`
          .firefly-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00ffff; /* DEBUG COLOR */
            box-shadow: 0 0 20px 6px rgba(0, 255, 255, 0.9);
          }
        `}
      </style>
    </div>
  );
}
