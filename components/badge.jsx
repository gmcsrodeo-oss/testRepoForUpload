import { STATUS_CONFIG, HEALTH_CONFIG, FUNCTION_COLORS, ROLE_CONFIG } from "@/constants/constants";

export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG["Not Started"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}
export function FunctionBadge({ func }) {
  const c = FUNCTION_COLORS[func] || {
    bg: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {func}
    </span>
  );
}
export function RoleBadge({ role }) {
  const c = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
      {c.label}
    </span>
  );
}
export function HealthBadge({ health }) {
  if (!health) return null;
  const c = HEALTH_CONFIG[health];
  if (!c) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {health}
    </span>
  );
}
export function ConfidentialBadge({ size = "text-xs" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 text-white ${size} font-medium`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
          clipRule="evenodd"
        />
      </svg>
      Confidential
    </span>
  );
}