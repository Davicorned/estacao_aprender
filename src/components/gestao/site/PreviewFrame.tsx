import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Monitor, Smartphone } from "lucide-react";

type Device = "desktop" | "mobile";

export function PreviewFrame({
  children,
  height = 600,
  mobileHeight = 780,
}: {
  children: ReactNode;
  height?: number;
  mobileHeight?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [scale, setScale] = useState(0.45);

  useLayoutEffect(() => {
    const targetW = device === "desktop" ? 1280 : 390;
    function recompute() {
      const w = wrapRef.current?.clientWidth ?? 0;
      if (w > 0) setScale(Math.min(1, w / targetW));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [device]);

  const h = device === "mobile" ? mobileHeight : height;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prévia ao vivo
        </p>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs ${
              device === "desktop"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs ${
              device === "mobile"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
        </div>
      </div>
      <div
        ref={wrapRef}
        className={`overflow-hidden rounded-xl border border-border bg-white ${
          device === "mobile" ? "mx-auto max-w-[420px]" : ""
        }`}
        style={{ height: Math.round(h * scale) }}
      >
        <div
          style={{
            width: device === "desktop" ? 1280 : 390,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}