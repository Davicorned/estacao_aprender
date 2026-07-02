import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteThemeProvider } from "../components/site/SiteThemeProvider";
import { SeoJsonLd, compactJsonLd } from "../components/site/SeoJsonLd";
import {
  fetchHeader,
  fetchRodape,
  fetchTema,
  fetchHero,
  HEADER_DEFAULTS,
  RODAPE_DEFAULTS,
  TEMA_DEFAULTS,
  HERO_DEFAULTS,
  type SiteHeader,
  type SiteRodape,
  type SiteTema,
  type SiteHero,
} from "../lib/cms";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return (await fn()) ?? fallback;
      } catch (err) {
        console.error("root SEO loader error", err);
        return fallback;
      }
    };
    const [header, rodape, tema, hero] = await Promise.all([
      safe<SiteHeader | null>(fetchHeader, null),
      safe<SiteRodape | null>(fetchRodape, null),
      safe<SiteTema | null>(fetchTema, null),
      safe<SiteHero | null>(fetchHero, null),
    ]);
    const h = { ...HEADER_DEFAULTS, ...(header ?? {}) } as SiteHeader;
    const r = { ...RODAPE_DEFAULTS, ...(rodape ?? {}) } as SiteRodape;
    const t = { ...TEMA_DEFAULTS, ...(tema ?? {}) } as SiteTema;
    const he = { ...HERO_DEFAULTS, ...(hero ?? {}) } as SiteHero;
    return {
      seo: {
        brand: h.nome_marca ?? "Estação Aprender",
        logo: h.logo_url ?? null,
        heroImage: he.imagem_url ?? null,
        telefone: r.telefone ?? null,
        telefoneLink: r.telefone_link ?? null,
        email: r.email ?? null,
        endereco: r.endereco_texto ?? null,
        redes: (r.redes_sociais ?? [])
          .map((s) => s?.url)
          .filter((u): u is string => !!u && u !== "#"),
        institucional: r.texto_institucional ?? null,
        themeColor: t.cor_primaria ?? "#D67F43",
      },
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.seo.brand ?? "Estação Aprender" },
      {
        name: "description",
        content:
          loaderData?.seo.institucional ??
          "Estação Aprender — acolhimento, desenvolvimento e aprendizagem para crianças, adolescentes e famílias.",
      },
      { name: "theme-color", content: loaderData?.seo.themeColor ?? "#D67F43" },
      { property: "og:title", content: loaderData?.seo.brand ?? "Estação Aprender" },
      {
        property: "og:description",
        content:
          loaderData?.seo.institucional ??
          "Acolhimento, desenvolvimento e aprendizagem para crianças, adolescentes e famílias.",
      },
      { property: "og:site_name", content: loaderData?.seo.brand ?? "Estação Aprender" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...(loaderData?.seo.logo || loaderData?.seo.heroImage
        ? [
            {
              property: "og:image",
              content: (loaderData?.seo.logo ?? loaderData?.seo.heroImage) as string,
            },
            {
              name: "twitter:image",
              content: (loaderData?.seo.logo ?? loaderData?.seo.heroImage) as string,
            },
          ]
        : []),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const data = Route.useLoaderData();
  const seo = data?.seo;

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "";

  const clinic = seo
    ? compactJsonLd({
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        name: seo.brand,
        url: origin || undefined,
        logo: seo.logo || undefined,
        image: seo.logo || seo.heroImage || undefined,
        telephone: seo.telefone || undefined,
        email: seo.email || undefined,
        address: seo.endereco
          ? {
              "@type": "PostalAddress",
              streetAddress: seo.endereco,
              addressCountry: "BR",
            }
          : undefined,
        sameAs: seo.redes.length ? seo.redes : undefined,
      })
    : null;

  const website = seo
    ? compactJsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: seo.brand,
        url: origin || undefined,
      })
    : null;

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <SiteThemeProvider>
        {clinic && <SeoJsonLd data={clinic} />}
        {website && <SeoJsonLd data={website} />}
        <Outlet />
      </SiteThemeProvider>
    </QueryClientProvider>
  );
}
