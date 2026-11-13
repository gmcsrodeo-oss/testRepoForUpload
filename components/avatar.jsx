export default function Avatar({ name, size = "w-8 h-8 text-xs" }) {
  const ini = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const cols = [
    "bg-red-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % cols.length;
  return (
    <div
      className={`${size} ${cols[idx]} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
    >
      {ini}
    </div>
  );
}