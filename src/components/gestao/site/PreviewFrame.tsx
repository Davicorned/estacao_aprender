import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone } from "lucide-react";

type Device = "desktop" | "mobile";

/**
 * Renderiza children dentro de um <iframe> com largura simulada (1280 ou 390 px).
 * Isso garante que as media queries do Tailwind (sm/md/lg) respondam à largura
 * SIMULADA, não à viewport real do navegador — assim Hero e Footer aparecem
 * exatamente como ficam no site.
 */
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [scale, setScale] = useState(0.45);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  const targetW = device === "desktop" ? 1280 : 390;
  const targetH = device === "mobile" ? mobileHeight : height;

  useLayoutEffect(() => {
    function recompute() {
      const w = wrapRef.current?.clientWidth ?? 0;
      if (w > 0) setScale(Math.min(1, w / targetW));
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [targetW]);

  // Inicializa o iframe: copia estilos da página pai e marca onde montar
  // a árvore React via portal.
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Limpa head e copia tags de estilo do documento pai (Tailwind + fontes).
    doc.head.innerHTML = "";
    const styleNodes = document.head.querySelectorAll(
      'style, link[rel="stylesheet"], link[rel="preload"][as="style"]'
    );
    styleNodes.forEach((node) => {
      doc.head.appendChild(node.cloneNode(true));
    });

    // Garante meta viewport para que media queries usem a largura do iframe.
    const meta = doc.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", `width=${targetW}`);
    doc.head.appendChild(meta);

    // Reset básico do body.
    doc.body.style.margin = "0";
    doc.body.style.background = "#ffffff";

    setMountNode(doc.body);
  };

  // Quando o device muda, o iframe é recriado (via key) e onLoad redispara.
  useEffect(() => {
    setMountNode(null);
  }, [device]);

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
        style={{ height: Math.round(targetH * scale) }}
      >
        <iframe
          key={device}
          ref={iframeRef}
          title="Prévia"
          srcDoc="<!doctype html><html><head></head><body></body></html>"
          onLoad={handleIframeLoad}
          style={{
            width: targetW,
            height: targetH,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "#fff",
          }}
        />
        {mountNode ? createPortal(children, mountNode) : null}
      </div>
    </div>
  );
}