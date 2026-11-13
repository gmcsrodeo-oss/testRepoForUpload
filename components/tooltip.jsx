export function fmtDollar(n, compact) {
    if (n == null || isNaN(n) || n === 0) 
    {
        return "$0";
    }  

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

export function DollarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) 
    {
        return null;
    }

    return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
            <div className="font-medium mb-1">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.color || p.fill }}
                />
                <span>
                    {p.name}: {fmtDollar(p.value, true)}
                </span>
                </div>
            ))}
        </div>
    );
}

export function NetTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg space-y-0.5">
            <div className="font-semibold mb-1">{d.name}</div>
            <div>Cost: {fmtDollar(d.cost, true)}</div>
            <div>Impact: {fmtDollar(d.impact, true)}</div>
            <div>
                Net: {d.net >= 0 ? "+" : ""}
                {fmtDollar(d.net, true)}
            </div>
            {d.roi != null && <div>ROI: {d.roi}%</div>}
        </div>
    );
}