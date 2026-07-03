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
  const [ready, setReady] = useState(false);

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
  // a árvore React via portal — só depois que os stylesheets clonados
  // terminarem de carregar (evita FOUC / conteúdo sem CSS por alguns ms).
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.head.innerHTML = "";

    // Meta viewport primeiro para media queries usarem a largura do iframe.
    const meta = doc.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", `width=${targetW}`);
    doc.head.appendChild(meta);

    // Clona estilos do pai; para cada <link> aguarda seu load.
    const styleNodes = document.head.querySelectorAll(
      'style, link[rel="stylesheet"], link[rel="preload"][as="style"]'
    );
    const linkPromises: Promise<void>[] = [];
    styleNodes.forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      if (clone.tagName === "LINK") {
        const link = clone as HTMLLinkElement;
        linkPromises.push(
          new Promise<void>((resolve) => {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              resolve();
            };
            link.addEventListener("load", finish, { once: true });
            link.addEventListener("error", finish, { once: true });
            // Timeout de segurança
            setTimeout(finish, 800);
          })
        );
      }
      doc.head.appendChild(clone);
    });

    // Reset básico do body — invisível até estilos carregarem.
    doc.body.style.margin = "0";
    doc.body.style.background = "#FEF3E8";
    doc.body.style.visibility = "hidden";

    // Monta o portal já (React precisa do node), mas mantém invisível.
    setMountNode(doc.body);
    setReady(false);

    Promise.all(linkPromises).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (iframe.contentDocument === doc) {
            doc.body.style.visibility = "visible";
            setReady(true);
          }
        });
      });
    });
  };

  // Quando o device muda, o iframe é recriado (via key) e onLoad redispara.
  useEffect(() => {
    setMountNode(null);
    setReady(false);
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
        className={`relative overflow-hidden rounded-xl border border-border bg-[#FEF3E8] ${
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
            background: "#FEF3E8",
            opacity: ready ? 1 : 0,
            transition: "opacity 120ms ease-out",
          }}
        />
        {mountNode ? createPortal(children, mountNode) : null}
      </div>
    </div>
  );
}