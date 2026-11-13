import { StatusBadge, HealthBadge } from './../badge';
import { HEALTH_CONFIG, STATUS_CONFIG } from '@/constants/constants';

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          How to Use the Initiative Tracker
        </h1>
        <p className="text-gray-500">
          A guide to entering and managing your strategic initiatives.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Initiative Statuses
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Each initiative moves through these stages.
        </p>
        <div className="space-y-4">
          {[
            {
              status: "Proposed",
              desc: "Submitted by a member, awaiting admin or executive approval.",
              criteria:
                "Moves to Not Started once approved. If rejected, owner can revise and resubmit.",
            },
            {
              status: "Not Started",
              desc: "Approved and entered, but no work has begun.",
              criteria:
                "Move to Planning once owner assigned and scoping begins.",
            },
            {
              status: "Planning",
              desc: "Active scoping and planning underway.",
              criteria:
                "Move to In Progress once scope defined, budget approved, resources assigned.",
            },
            {
              status: "In Progress",
              desc: "Actively being executed. Milestones being hit, value starting to deliver.",
              criteria:
                "Move to Complete once all milestones done. Move to On Hold if blocked.",
            },
            {
              status: "On Hold",
              desc: "Paused due to constraints or dependencies.",
              criteria: "Move back to In Progress once blocker resolved.",
            },
            {
              status: "Complete",
              desc: "Fully executed and delivering value.",
              criteria: "Final state. Update financial actuals.",
            },
          ].map((s) => (
            <div key={s.status} className="flex gap-4">
              <div className="w-28 shrink-0 pt-0.5">
                <StatusBadge status={s.status} />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-1">{s.desc}</p>
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-500">
                    When to move:
                  </span>{" "}
                  {s.criteria}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Financial Details Guide
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Reasonable estimates are fine and can be refined over time.
        </p>
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Initial Cost
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Total upfront investment including software, consulting,
              implementation, training.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Example
              </p>
              <p className="text-sm text-gray-700">
                $80K license + $60K implementation + $25K labor + $15K training
                = <span className="font-bold">$180K</span>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Annualized Impact
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Projected yearly benefit at steady state.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Example
              </p>
              <p className="text-sm text-gray-700">
                ~$15K/location/year x 47 locations ={" "}
                <span className="font-bold">$720K annualized</span>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Impact Type
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Cost Savings</span> = reducing
              spend. <span className="font-semibold">Revenue Growth</span> = new
              revenue. <span className="font-semibold">Cost Avoidance</span> =
              preventing future costs.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-1">
              Monthly Value Delivery
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Map the realistic ramp-up over 12 months.
            </p>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                Example ramp for $720K/yr
              </p>
              <p className="text-sm text-gray-700">
                Months 1-2: $0 (implementation) then Month 3: $30K then Month 5:
                $55K then Months 8-12: $65-70K/mo
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Writing Good Milestones
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-emerald-800 mb-2">
              Good milestones
            </h3>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>&quot;Vendor shortlist finalized (3 candidates)&quot;</li>
              <li>&quot;Pilot launched at 5 locations&quot;</li>
              <li>&quot;Board approval received&quot;</li>
              <li>&quot;90-day retention data collected&quot;</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-800 mb-2">Avoid these</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>&quot;Make progress on rollout&quot;</li>
              <li>&quot;Continue working on it&quot;</li>
              <li>&quot;Finalize things&quot;</li>
              <li>&quot;Phase 2&quot;</li>
            </ul>
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-2">How many?</h3>
          <p className="text-sm text-amber-700">
            Aim for <span className="font-bold">3 to 6 milestones</span>. Think
            of them as the headlines you would share if the CEO asked
            &quot;where are we on this?&quot;
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Health (RAG) vs. Status
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Status tracks stage. Health tracks whether it's on track. They move
          independently.
        </p>
        <div className="space-y-3">
          {Object.entries(HEALTH_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-start gap-4">
              <div className="w-24 shrink-0 pt-0.5">
                <HealthBadge health={k} />
              </div>
              <p className="text-sm text-gray-600">
                {k === "Green"
                  ? "On track. No leadership action needed."
                  : k === "Amber"
                    ? "At risk. Worth watching; owner should note the risk."
                    : "Off track. Needs leadership attention or escalation."}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Confidential Initiatives
        </h2>
        <p className="text-sm text-gray-600">
          Flagging an initiative confidential restricts visibility to the owner,
          admins, and executives — even from people in the relevant function
          who'd normally see it. Use for sensitive matters like compensation
          changes, M&A, or competitive actions. Confidential initiatives are
          also excluded from the dollar totals members see on the Summary tab.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Key Metrics Reference
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-semibold text-gray-800">Net Impact</span>
            <p className="text-gray-500 mt-0.5">
              Annualized Impact minus Initial Cost.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-semibold text-gray-800">ROI %</span>
            <p className="text-gray-500 mt-0.5">
              (Impact - Cost) / Cost x 100.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-semibold text-gray-800">Payback Period</span>
            <p className="text-gray-500 mt-0.5">
              Months until cumulative value equals initial cost.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="font-semibold text-gray-800">Portfolio ROI</span>
            <p className="text-gray-500 mt-0.5">
              Combined ROI across all initiatives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}