export function Placeholder({
  message = "Em breve — esta área será ativada na próxima fase.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}