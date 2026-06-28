import { createFileRoute } from "@tanstack/react-router";
import { HeroManager } from "@/components/gestao/site/HeroManager";

export const Route = createFileRoute("/gestao/site/layout/hero")({
  component: HeroManager,
});