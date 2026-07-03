import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "../FadeUp";
import { fetchTeam, type TeamMember } from "@/lib/cms";
import type { EquipeLayout } from "@/lib/site-templates";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type CardProps = {
  nome: string;
  titulo: string;
  foto?: string | null;
  especialidades: string[];
  bio?: string | null;
  registro?: string | null;
  mostrar_especialidades?: boolean;
  mostrar_registro?: boolean;
};

function TeamCard({
  nome,
  titulo,
  foto,
  especialidades,
  bio,
  registro,
  mostrar_especialidades = true,
  mostrar_registro = true,
}: CardProps) {
  const [open, setOpen] = useState(false);
  const iniciais = nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:shadow-[var(--site-primary)]/10">
      <div className="aspect-square overflow-hidden bg-[var(--site-soft)]">
        {foto ? (
          <img
            src={foto}
            alt={nome}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-4xl font-bold text-white">
              {iniciais}
            </div>
          </div>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-primary-hover)]" />

      <div className="p-5">
        <h3 className="mb-1 text-base font-semibold text-gray-900">{nome}</h3>
        <p className="mb-3 text-sm font-medium text-[var(--site-primary)]">{titulo}</p>

        {mostrar_especialidades && especialidades.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {especialidades.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--site-soft)] px-2.5 py-1 text-xs font-medium text-[var(--site-primary-hover)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[var(--site-primary)]"
        >
          <span>{open ? "Menos detalhes" : "Ver detalhes"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 border-t border-gray-100 px-5 pt-4 pb-5">
          {mostrar_registro && registro && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Registro
              </p>
              <p className="text-sm text-gray-600">{registro}</p>
            </div>
          )}

          {bio && (
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Sobre
              </p>
              <p className="text-sm leading-relaxed text-gray-600">{bio}</p>
            </div>
          )}

          {mostrar_especialidades && especialidades.length > 3 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Todas as especialidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {especialidades.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--site-soft)] px-2.5 py-1 text-xs font-medium text-[var(--site-primary-hover)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type TeamSectionProps = {
  eyebrow?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  layout?: EquipeLayout;
  colunas?: 2 | 3 | 4;
  mostrar_especialidades?: boolean;
  mostrar_registro?: boolean;
  bg?: string | null;
  textColor?: string | null;
  /** SSR-provided team (skips client fetch). */
  initial?: TeamMember[];
};

export function TeamSection({
  eyebrow = "Nossa equipe",
  titulo = "Profissionais especializados para o seu filho",
  descricao = "Cada profissional com dedicação específica ao desenvolvimento de crianças e adolescentes",
  layout = "grade",
  colunas = 3,
  mostrar_especialidades = true,
  mostrar_registro = true,
  bg = null,
  textColor = null,
  initial,
}: TeamSectionProps = {}) {
  const [equipe, setEquipe] = useState<TeamMember[]>(initial ?? []);

  useEffect(() => {
    if (initial && initial.length > 0) { setEquipe(initial); return; }
    void fetchTeam().then(setEquipe);
  }, [initial]);

  if (equipe.length === 0) {
    return null;
  }

  const gridColsClass =
    colunas === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : colunas === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      className={bg ? "py-20" : "bg-white py-20"}
      style={{
        ...(bg ? { background: bg } : {}),
        ...(textColor ? { color: textColor } : {}),
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mb-16 text-center">
          {eyebrow && (
            <span className="text-sm font-medium uppercase tracking-wider text-[var(--site-primary)]">
              {eyebrow}
            </span>
          )}
          {titulo && (
            <h2
              className={`mt-3 mb-4 text-3xl font-bold md:text-4xl ${textColor ? "" : "text-gray-900"}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {titulo}
            </h2>
          )}
          {descricao && (
            <p
              className={`mx-auto max-w-2xl ${textColor ? "opacity-90" : "text-gray-600"}`}
              style={textColor ? { color: textColor } : undefined}
            >
              {descricao}
            </p>
          )}
        </FadeUp>

        <TeamLayout
          layout={layout}
          equipe={equipe}
          colunas={colunas}
          gridColsClass={gridColsClass}
          mostrar_especialidades={mostrar_especialidades}
          mostrar_registro={mostrar_registro}
        />
      </div>
    </section>
  );
}

function TeamLayout({
  layout,
  equipe,
  colunas,
  gridColsClass,
  mostrar_especialidades,
  mostrar_registro,
}: {
  layout: EquipeLayout;
  equipe: TeamMember[];
  colunas: 2 | 3 | 4;
  gridColsClass: string;
  mostrar_especialidades: boolean;
  mostrar_registro: boolean;
}) {
  if (layout === "carrossel") {
    return <TeamCarousel equipe={equipe} mostrar_especialidades={mostrar_especialidades} mostrar_registro={mostrar_registro} />;
  }
  if (layout === "circulos") {
    return <TeamCirculos equipe={equipe} gridColsClass={gridColsClass} />;
  }
  if (layout === "lista-perfil") {
    return <TeamListaPerfil equipe={equipe} mostrar_especialidades={mostrar_especialidades} mostrar_registro={mostrar_registro} />;
  }
  if (layout === "destaque-grade") {
    return <TeamDestaqueGrade equipe={equipe} gridColsClass={gridColsClass} mostrar_especialidades={mostrar_especialidades} mostrar_registro={mostrar_registro} />;
  }
  if (layout === "mosaico") {
    return <TeamMosaico equipe={equipe} gridColsClass={gridColsClass} />;
  }
  // grade (default)
  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {equipe.map((p, idx) => (
        <FadeUp key={p.id} delay={idx * 0.05}>
          <TeamCard
            {...p}
            foto={p.foto_url}
            mostrar_especialidades={mostrar_especialidades}
            mostrar_registro={mostrar_registro}
          />
        </FadeUp>
      ))}
    </div>
  );
}

function TeamCarousel({
  equipe,
  mostrar_especialidades,
  mostrar_registro,
}: {
  equipe: TeamMember[];
  mostrar_especialidades: boolean;
  mostrar_registro: boolean;
}) {
  return (
    <div className="relative px-2 sm:px-12">
      <Carousel opts={{ align: "start", loop: false }}>
        <CarouselContent>
          {equipe.map((p) => (
            <CarouselItem key={p.id} className="basis-[85%] sm:basis-1/2 lg:basis-1/3">
              <TeamCard
                {...p}
                foto={p.foto_url}
                mostrar_especialidades={mostrar_especialidades}
                mostrar_registro={mostrar_registro}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}

function TeamCirculos({ equipe, gridColsClass }: { equipe: TeamMember[]; gridColsClass: string }) {
  return (
    <div className={`grid gap-8 ${gridColsClass}`}>
      {equipe.map((p, idx) => {
        const iniciais = p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <FadeUp key={p.id} delay={idx * 0.05} className="flex flex-col items-center text-center">
            <div className="h-40 w-40 overflow-hidden rounded-full bg-[var(--site-soft)] shadow-md">
              {p.foto_url ? (
                <img src={p.foto_url} alt={p.nome} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-3xl font-bold text-white">
                  {iniciais}
                </div>
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold">{p.nome}</h3>
            <p className="text-sm text-[var(--site-primary)]">{p.titulo}</p>
          </FadeUp>
        );
      })}
    </div>
  );
}

function TeamListaPerfil({
  equipe,
  mostrar_especialidades,
  mostrar_registro,
}: {
  equipe: TeamMember[];
  mostrar_especialidades: boolean;
  mostrar_registro: boolean;
}) {
  return (
    <div className="space-y-12">
      {equipe.map((p, idx) => {
        const reverse = idx % 2 === 1;
        const iniciais = p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <FadeUp key={p.id} delay={idx * 0.05}>
            <div className={`grid items-center gap-8 md:grid-cols-2 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--site-soft)] shadow-lg">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.nome} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-6xl font-bold text-white">
                    {iniciais}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{p.nome}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--site-primary)]">{p.titulo}</p>
                {mostrar_registro && p.registro && (
                  <p className="mt-1 text-xs uppercase tracking-wider opacity-70">{p.registro}</p>
                )}
                {p.bio && <p className="mt-4 text-sm leading-relaxed opacity-90">{p.bio}</p>}
                {mostrar_especialidades && p.especialidades.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.especialidades.map((tag) => (
                      <span key={tag} className="rounded-full bg-[var(--site-soft)] px-2.5 py-1 text-xs font-medium text-[var(--site-primary-hover)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}

function TeamDestaqueGrade({
  equipe,
  gridColsClass,
  mostrar_especialidades,
  mostrar_registro,
}: {
  equipe: TeamMember[];
  gridColsClass: string;
  mostrar_especialidades: boolean;
  mostrar_registro: boolean;
}) {
  const [featured, ...rest] = equipe;
  const iniciais = featured.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="space-y-12">
      <FadeUp>
        <div className="grid items-center gap-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg md:grid-cols-2 md:p-10">
          <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--site-soft)]">
            {featured.foto_url ? (
              <img src={featured.foto_url} alt={featured.nome} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-6xl font-bold text-white">
                {iniciais}
              </div>
            )}
          </div>
          <div className="text-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--site-primary)]">Em destaque</span>
            <h3 className="mt-2 text-2xl font-bold md:text-3xl">{featured.nome}</h3>
            <p className="mt-1 text-base font-medium text-[var(--site-primary)]">{featured.titulo}</p>
            {mostrar_registro && featured.registro && (
              <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{featured.registro}</p>
            )}
            {featured.bio && <p className="mt-4 leading-relaxed text-gray-600">{featured.bio}</p>}
            {mostrar_especialidades && featured.especialidades.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {featured.especialidades.map((tag) => (
                  <span key={tag} className="rounded-full bg-[var(--site-soft)] px-2.5 py-1 text-xs font-medium text-[var(--site-primary-hover)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeUp>
      {rest.length > 0 && (
        <div className={`grid gap-6 ${gridColsClass}`}>
          {rest.map((p, idx) => (
            <FadeUp key={p.id} delay={idx * 0.05}>
              <TeamCard
                {...p}
                foto={p.foto_url}
                mostrar_especialidades={mostrar_especialidades}
                mostrar_registro={mostrar_registro}
              />
            </FadeUp>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamMosaico({ equipe, gridColsClass }: { equipe: TeamMember[]; gridColsClass: string }) {
  return (
    <div className={`grid gap-3 ${gridColsClass}`}>
      {equipe.map((p, idx) => {
        const iniciais = p.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <FadeUp key={p.id} delay={idx * 0.04}>
            <div className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--site-soft)] shadow-md">
              {p.foto_url ? (
                <img src={p.foto_url} alt={p.nome} className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--site-primary)] to-[var(--site-primary-hover)] text-4xl font-bold text-white">
                  {iniciais}
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
                <h3 className="text-base font-semibold text-white">{p.nome}</h3>
                <p className="text-xs text-white/90">{p.titulo}</p>
              </div>
            </div>
          </FadeUp>
        );
      })}
    </div>
  );
}