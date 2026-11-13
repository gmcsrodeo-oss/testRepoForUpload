"use client";
import { useState, useMemo } from "react";
import { FUNCTIONS, STATUS_LIST, MONTHS, FUNCTION_COLORS, STATUS_CONFIG } from "@/constants/constants";
import ChartCard from './../chart-card';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, BarChart, Bar, Cell, LabelList, PieChart, Pie, Legend } from "recharts";
import { DollarTooltip, NetTooltip } from '../tooltip';
import { HealthStatus, InitiativeStatus } from '../../enums/status';
import { HealthBadge, FunctionBadge } from "../badge";

export default function ExecutiveSummary({initiatives,users,currentUser,onSelectInitiative,hiddenCount = 0,}) 
{
  const [msFilter, setMsFilter] = useState("all");
  const proposedCount = initiatives === null ? 0 : initiatives.filter(
    (i) => i.status === InitiativeStatus.PROPOSED,
  ).length;

  const committed = useMemo(
    () => initiatives.filter((i) => i.status !== InitiativeStatus.PROPOSED),
    [initiatives],
  ); // exclude unapproved proposals from committed $ figures

  const totalCost = committed.reduce(
    (s, i) => s + (i.financials?.initialCost || 0),
    0,
  );

  console.log("Total Cost: ", totalCost);

  const totalImpact = committed.reduce(
    (s, i) => s + (i.financials?.annualizedImpact || 0),
    0,
  );

  console.log("totalImpact: " , totalImpact)

  const totalNet = totalImpact - totalCost;

  console.log("totalNet:" , totalNet);

  const activeCount = initiatives.filter(
    (i) => i.status === InitiativeStatus.INPROGRESS,
  ).length;

  const funcStatusData = useMemo(
    () =>
      FUNCTIONS.map((f) => {
        const inits = initiatives.filter((i) => i.func === f);
        if (!inits.length) return null;
        const row = { name: f };
        STATUS_LIST.forEach((s) => {
          row[s] = inits.filter((i) => i.status === s).length;
        });
        return row;
      }).filter(Boolean),
    [initiatives],
  );

  const funcImpactData = useMemo(
    () =>
      FUNCTIONS.map((f) => {
        const inits = committed.filter((i) => i.func === f);
        const impact = inits.reduce(
          (s, i) => s + (i.financials?.annualizedImpact || 0),
          0,
        );
        const cost = inits.reduce(
          (s, i) => s + (i.financials?.initialCost || 0),
          0,
        );
        if (!impact && !cost) return null;
        return {
          name: f,
          impact,
          cost,
          count: inits.length,
          fill: FUNCTION_COLORS[f]?.hex || "#9ca3af",
        };
      }).filter(Boolean),
    [committed],
  );

  const funcNetData = useMemo(
    () =>
      funcImpactData
        .map((d) => ({
          ...d,
          net: d.impact - d.cost,
          roi:
            d.cost > 0
              ? Math.round(((d.impact - d.cost) / d.cost) * 100)
              : null,
        }))
        .sort((a, b) => b.net - a.net),
    [funcImpactData],
  );

  function fmtDollar(n, compact) {
  if (n == null || isNaN(n) || n === 0) return "$0";
  if (compact) {
    if (Math.abs(n) >= 1e6)
      return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

  const statusImpactData = useMemo(
    () =>
      STATUS_LIST.filter((s) => s !== InitiativeStatus.PROPOSED)
        .map((s) => {
          const t = committed
            .filter((i) => i.status === s)
            .reduce((sum, i) => sum + (i.financials?.annualizedImpact || 0), 0);
          if (!t) return null;
          return { name: s, value: t, fill: STATUS_CONFIG[s].hex };
        })
        .filter(Boolean),
    [committed],
  );

  const cumulativeData = useMemo(() => {
    const mm = {};
    committed.forEach((init) =>
      (init.financials?.monthlyBreakdown || []).forEach((mb) => {
        mm[mb.month] = (mm[mb.month] || 0) + mb.value;
      }),
    );
    const ent = Object.entries(mm).sort((a, b) => {
      const [mA, yA] = a[0].split(" ");
      const [mB, yB] = b[0].split(" ");
      return (
        parseInt(yA) * 12 +
        MONTHS.indexOf(mA) -
        (parseInt(yB) * 12 + MONTHS.indexOf(mB))
      );
    });
    let cum = 0;
    return ent.map(([month, value]) => {
      cum += value;
      return { month, monthly: value, cumulative: cum };
    });
  }, [committed]);

  //const upcomingMilestones = [];
  const upcomingMilestones = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 90 * 86400000);
    const all = [];
    initiatives.forEach((init) =>
      init.milestones.forEach((ms) => {
        if (ms.done || !ms.dueDate) return;
        if (
          msFilter === "mine" &&
          !(ms.assignees || []).includes(currentUser?.id)
        )
          return;
        const due = new Date(ms.dueDate);
        if (due <= cutoff)
          all.push({
            ...ms,
            initId: init.id,
            initTitle: init.title,
            func: init.func,
            overdue: due < now,
          });
      }),
    );
    all.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return all;
  }, [initiatives, msFilter, currentUser]);

  const raggedInits = useMemo(() => {
    const order = { Red: 0, Amber: 1 };
    return initiatives
      .filter((i) => i.health === HealthStatus.RED || i.health === HealthStatus.AMBER)
      .map((i) => {
        const next = (i.milestones || [])
          .filter((m) => !m.done && m.dueDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
        return { ...i, nextMilestone: next };
      })
      .sort(
        (a, b) =>
          order[a.health] - order[b.health] ||
          (b.financials?.annualizedImpact || 0) -
            (a.financials?.annualizedImpact || 0),
      );
  }, [initiatives]);

  const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    const R = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    return (
      <text
        x={cx + r * Math.cos(-midAngle * R)}
        y={cy + r * Math.sin(-midAngle * R)}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {fmtDollar(value, true)}
      </text>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          {
            label: "Total Initiatives",
            val: String(initiatives.length),
            sub: `${activeCount} in progress${proposedCount ? ` · ${proposedCount} proposed` : ""}`,
          },
          {
            label: "Total Investment",
            val: fmtDollar(totalCost, true),
            sub: "initial cost, committed",
            color: "text-gray-900",
          },
          {
            label: "Total Impact",
            val: fmtDollar(totalImpact, true),
            sub: "annualized, committed",
            color: "text-sky-600",
          },
          {
            label: "Net Value",
            val: `${totalNet >= 0 ? "+" : ""}${fmtDollar(totalNet, true)}`,
            sub: "impact − cost",
            color: totalNet >= 0 ? "text-emerald-600" : "text-red-600",
          },
          {
            label: "Portfolio ROI",
            val:
              totalCost > 0
                ? Math.round(((totalImpact - totalCost) / totalCost) * 100) +
                  "%"
                : "—",
            sub: "return on investment",
            color: totalNet >= 0 ? "text-emerald-600" : "text-red-600",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {c.label}
            </div>
            <div
              className={`text-2xl font-bold mt-1 ${c.color || "text-gray-900"}`}
            >
              {c.val}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 -mt-2">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          {hiddenCount} confidential initiative{hiddenCount !== 1 ? "s" : ""}{" "}
          not shown to you — figures above exclude{" "}
          {hiddenCount !== 1 ? "them" : "it"}.
        </div>
      )}
      <ChartCard
        title={`Needs Attention — Red & Amber (${raggedInits.length})`}
        className="mb-4"
      >
        {raggedInits.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Nothing flagged Red or Amber. Clean board.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="py-2 px-1 font-semibold">RAG</th>
                  <th className="py-2 px-1 font-semibold">Initiative</th>
                  <th className="py-2 px-1 font-semibold">Owner</th>
                  <th className="py-2 px-1 font-semibold">Function</th>
                  <th className="py-2 px-1 font-semibold">Why</th>
                  <th className="py-2 px-1 font-semibold">Next milestone</th>
                  <th className="py-2 px-1 font-semibold text-right">
                    $ Impact at risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {raggedInits.map((init) => {
                  const owner = users.find((u) => u.id === init.ownerId);
                  return (
                    <tr
                      key={init.id}
                      onClick={() => onSelectInitiative(init.id)}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-2.5 px-1">
                        <HealthBadge health={init.health} />
                      </td>
                      <td className="py-2.5 px-1 font-medium text-gray-900 max-w-[200px] truncate">
                        {init.title}
                        {init.confidential && (
                          <svg
                            className="w-3 h-3 inline-block ml-1.5 -mt-0.5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </td>
                      <td className="py-2.5 px-1 text-gray-600 whitespace-nowrap">
                        {owner?.name || "—"}
                      </td>
                      <td className="py-2.5 px-1">
                        <FunctionBadge func={init.func} />
                      </td>
                      <td className="py-2.5 px-1 text-gray-500 max-w-[240px] truncate">
                        {init.healthNote || "—"}
                      </td>
                      <td className="py-2.5 px-1 text-gray-600 whitespace-nowrap">
                        {init.nextMilestone ? (
                          <span>
                            {init.nextMilestone.title}
                            <span
                              className={`ml-1.5 text-xs ${new Date(init.nextMilestone.dueDate) < new Date() ? "text-red-500 font-medium" : "text-gray-400"}`}
                            >
                              {formatDate(init.nextMilestone.dueDate)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-300 italic">None set</span>
                        )}
                      </td>
                      <td className="py-2.5 px-1 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {fmtDollar(
                          init.financials?.annualizedImpact || 0,
                          true,
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Initiatives by Function">
          {funcStatusData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data</p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(funcStatusData.length * 44, 160)}
            >
              <BarChart
                data={funcStatusData}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <Tooltip />
                {STATUS_LIST.map((s) => (
                  <Bar
                    key={s}
                    dataKey={s}
                    stackId="a"
                    fill={STATUS_CONFIG[s].hex}
                    name={s}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Annualized Impact by Status">
          {statusImpactData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusImpactData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                >
                  {statusImpactData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span className="text-xs text-gray-600">{v}</span>
                  )}
                />
                <Tooltip content={<DollarTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Net Value by Function">
          {funcNetData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data</p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(funcNetData.length * 44, 160)}
            >
              <BarChart
                data={funcNetData}
                layout="vertical"
                margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => fmtDollar(v, true)}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12, fill: "#374151" }}
                />
                <Tooltip content={<NetTooltip />} />
                <Bar dataKey="net" radius={[0, 4, 4, 0]}>
                  {funcNetData.map((d, i) => (
                    <Cell key={i} fill={d.net >= 0 ? d.fill : "#f87171"} />
                  ))}
                  <LabelList
                    dataKey="roi"
                    position="right"
                    formatter={(v) => (v != null ? v + "% ROI" : "—")}
                    style={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Cumulative Value Delivery">
          {cumulativeData.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No monthly breakdowns entered yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={cumulativeData}
                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D72027" stopOpacity={0.15} />
                    <stop
                      offset="100%"
                      stopColor="#D72027"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                />
                <YAxis
                  tickFormatter={(v) => fmtDollar(v, true)}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  width={60}
                />
                <Tooltip content={<DollarTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="#D72027"
                  fill="url(#grad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="monthly"
                  name="Monthly"
                  stroke="#fca5a5"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
      <ChartCard
        title={`Upcoming Milestones — Next 90 Days (${upcomingMilestones.length})`}
        action={
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setMsFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all ${msFilter === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              All
            </button>
            <button
              onClick={() => setMsFilter("mine")}
              className={`px-2.5 py-1 rounded-md transition-all ${msFilter === "mine" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Mine
            </button>
          </div>
        }
      >
        {upcomingMilestones.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            {msFilter === "mine"
              ? "No upcoming milestones tagged to you."
              : "No upcoming milestones."}
          </p>
        ) : (
          <div className="divide-y divide-gray-100 -mx-1">
            {upcomingMilestones.slice(0, 12).map((ms) => {
              const msAssignees = (ms.assignees || [])
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean);
              const isMine = (ms.assignees || []).includes(currentUser?.id);
              return (
                <button
                  key={ms.id}
                  onClick={() => onSelectInitiative(ms.initId)}
                  className={`flex items-center gap-4 px-3 py-2.5 w-full text-left hover:bg-gray-50 rounded-lg transition-colors ${isMine ? "bg-amber-50/50" : ""}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${ms.overdue ? "bg-red-500" : "bg-gray-300"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900">
                      {ms.title}
                      {isMine && (
                        <span className="ml-1.5 text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {ms.initTitle}
                      {msAssignees.length > 0 && (
                        <span className="text-amber-500 ml-1.5">
                          {" "}
                          · Needs{" "}
                          {msAssignees
                            .map((u) => u.name.split(" ")[0])
                            .join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                  {msAssignees.length > 0 && (
                    <div className="flex -space-x-1.5 shrink-0">
                      {msAssignees.map((u) => (
                        <div key={u.id} title={u.name}>
                          <Avatar
                            name={u.name}
                            size="w-5 h-5 text-xs ring-2 ring-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <FunctionBadge func={ms.func} />
                  <span
                    className={`text-xs font-medium shrink-0 ${ms.overdue ? "text-red-600" : "text-gray-500"}`}
                  >
                    {ms.overdue ? "Overdue · " : ""}
                    {formatDate(ms.dueDate)}
                  </span>
                </button>
              );
            })}
            {upcomingMilestones.length > 12 && (
              <div className="text-xs text-gray-400 text-center py-2">
                +{upcomingMilestones.length - 12} more
              </div>
            )}
          </div>
        )}
      </ChartCard>
    </div>
  );
}