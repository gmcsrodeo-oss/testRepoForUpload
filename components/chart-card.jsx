export default function ChartCard({ title, children, className = "", action }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}