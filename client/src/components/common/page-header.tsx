export function PageHeader({ title }: { title: string }) {
  return (
    <header>
      <h1 className="text-display-xs font-semibold text-primary">{title}</h1>
    </header>
  );
}
