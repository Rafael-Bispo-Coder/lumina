interface KpiGridProps {
  data: Array<{ label: string; value: number | string }>;
}

export const KpiGrid = ({ data }: KpiGridProps) => (
  <div className="kpi-grid">
    {data.map((item) => (
      <article key={item.label} className="kpi-card">
        <span>{item.label}</span>
        <strong>{item.value}</strong>
      </article>
    ))}
  </div>
);
