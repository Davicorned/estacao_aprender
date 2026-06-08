import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOST = "iscgrqldjytzhhvtgcmy.supabase.co";
const ALLOWED_PREFIX = `https://${ALLOWED_HOST}/storage/v1/object/sign/`;

export const Route = createFileRoute("/api/public/file-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const u = new URL(request.url);
        const target = u.searchParams.get("url");
        if (!target || !target.startsWith(ALLOWED_PREFIX)) {
          return new Response("Invalid URL", { status: 400 });
        }

        const upstream = await fetch(target);
        if (!upstream.ok || !upstream.body) {
          return new Response("Upstream error", { status: upstream.status || 502 });
        }

        const headers = new Headers();
        const ct = upstream.headers.get("content-type");
        if (ct) headers.set("content-type", ct);
        const cl = upstream.headers.get("content-length");
        if (cl) headers.set("content-length", cl);
        headers.set("cache-control", "private, max-age=0, no-store");
        headers.set("content-disposition", "inline");

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});