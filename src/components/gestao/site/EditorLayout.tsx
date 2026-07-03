import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export type EditorLayoutTab = {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
};

export interface EditorLayoutProps {
  title?: string;
  tabs: EditorLayoutTab[];
  preview?: ReactNode;
  defaultTab?: string;
  footer?: ReactNode;
}

/**
 * Layout reutilizável para editores do site: abas à esquerda + prévia sticky à direita.
 * No mobile, as abas ficam em cima e a prévia embaixo.
 */
export function EditorLayout({ title, tabs, preview, defaultTab, footer }: EditorLayoutProps) {
  const initial = defaultTab ?? tabs[0]?.value;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,560px)_1fr]">
      <div className="space-y-4">
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
        <Tabs defaultValue={initial}>
          <TabsList className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                {t.icon}
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="space-y-6 pt-4">
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
        {footer && <div className="pt-2">{footer}</div>}
      </div>

      {preview && (
        <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          {preview}
        </div>
      )}
    </div>
  );
}