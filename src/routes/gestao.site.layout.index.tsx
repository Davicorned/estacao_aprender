import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gestao/site/layout/")({
  beforeLoad: () => {
    throw redirect({ to: "/gestao/site/layout/hero" });
  },
});