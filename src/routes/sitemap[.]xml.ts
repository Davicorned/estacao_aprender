import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { pageCanonicalUrl } from "@/lib/site-page-routes";

const STATIC_ROUTES = ["/", "/QuemSomos", "/Servicos", "/Atendimento", "/Contato", "/blog"];

function xmlEscape(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        type Entry = { path: string; lastmod?: string };
        const entries = new Map<string, Entry>();
        for (const p of STATIC_ROUTES) entries.set(p, { path: p });

        try {
          const { data } = await supabase
            .from("site_paginas")
            .select("slug, is_home, enabled, updated_at")
            .eq("enabled", true);
          for (const row of (data ?? []) as Array<{
            slug: string;
            is_home: boolean;
            updated_at?: string | null;
          }>) {
            const path = pageCanonicalUrl(row.slug, row.is_home);
            const prev = entries.get(path);
            entries.set(path, {
              path,
              lastmod: row.updated_at ?? prev?.lastmod,
            });
          }
        } catch (err) {
          console.error("sitemap fetch error", err);
        }

        try {
          const { data } = await supabase
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("status", "publicado");
          for (const row of (data ?? []) as Array<{ slug: string; updated_at?: string | null }>) {
            const path = `/blog/${row.slug}`;
            entries.set(path, { path, lastmod: row.updated_at ?? undefined });
          }
        } catch (err) {
          console.error("sitemap blog fetch error", err);
        }

        const urls = Array.from(entries.values())
          .map((e) => {
            const loc = `${origin}${e.path}`;
            const lastmod = e.lastmod
              ? `\n    <lastmod>${xmlEscape(new Date(e.lastmod).toISOString())}</lastmod>`
              : "";
            return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod}\n  </url>`;
          })
          .join("\n");

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls +
          `\n</urlset>\n`;

        return new Response(xml, {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});