type PageHeaderProps = {
  title: string;
  subtitle: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header-block">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}
