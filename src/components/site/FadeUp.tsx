import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

type FadeUpProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number;
  immediate?: boolean;
};

export function FadeUp({
  children,
  delay = 0,
  immediate = false,
  className = "",
  style,
  ...rest
}: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (immediate || reduced) {
      el.classList.add("fade-up--in");
      return;
    }

    el.classList.add("fade-up--anim");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("fade-up--in");
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}