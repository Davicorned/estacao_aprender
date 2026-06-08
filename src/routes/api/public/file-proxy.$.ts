import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOST = "iscgrqldjytzhhvtgcmy.supabase.co";
const ALLOWED_PREFIX = `https://${ALLOWED_HOST}/storage/v1/object/sign/`;

function base64urlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  // atob is available in the Workers runtime
  return atob(b64);
}

export const Route = createFileRoute("/api/public/file-proxy/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const splat = params._splat ?? "";
        // The first segment is the base64url-encoded signed URL.
        // Optional trailing segments (e.g. a filename) are ignored — they only
        // exist so the browser/iframe sees a friendly extension like .pdf.
        const token = splat.split("/")[0] ?? "";
        if (!token) return new Response("Missing token", { status: 400 });

        let target: string;
        try {
          target = base64urlDecode(token);
        } catch {
          return new Response("Invalid token", { status: 400 });
        }
        if (!target.startsWith(ALLOWED_PREFIX)) {
          return new Response("Invalid URL", { status: 400 });
        }

        const u = new URL(request.url);
        const download = u.searchParams.get("download") === "1";
        const filename = (u.searchParams.get("filename") || "arquivo").replace(
          /[^\w.\- ]+/g,
          "_",
        );

        const upstream = await fetch(target);
        if (!upstream.ok || !upstream.body) {
          return new Response("Upstream error", {
            status: upstream.status || 502,
          });
        }

        const headers = new Headers();
        const ct = upstream.headers.get("content-type");
        if (ct) headers.set("content-type", ct);
        const cl = upstream.headers.get("content-length");
        if (cl) headers.set("content-length", cl);
        headers.set("cache-control", "private, max-age=0, no-store");
        headers.set("x-content-type-options", "nosniff");
        headers.set(
          "content-disposition",
          download ? `attachment; filename="${filename}"` : "inline",
        );

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});