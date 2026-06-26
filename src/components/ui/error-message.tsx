export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
      ⚠️ {message}
    </div>
  );
}
