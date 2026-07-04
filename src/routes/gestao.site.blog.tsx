import { createFileRoute } from "@tanstack/react-router";
import { BlogManager } from "@/components/gestao/site/BlogManager";

export const Route = createFileRoute("/gestao/site/blog")({
  component: BlogManager,
});