export default function DashboardPreview() {
  return (//hehe
    <div className="rounded-lg border border-gray-800 bg-[#0d1829] p-4 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Overview</span>
        
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Visibility", value: "78%", change: "+9%", color: "blue" },
          { label: "Traffic", value: "123.4K", change: "+67", color: "purple" },
          { label: "Position Avg.", value: "12.3", change: "+4.5", color: "cyan" },
          { label: "Visual Rank Avg.", value: "13.2", change: "-2", color: "orange" },
        ].map((metric) => (
          <div key={metric.label} className="bg-[#1a2b4b]/30 rounded-lg p-4">
            <div className="mb-2 text-sm text-gray-400">{metric.label}</div>
            <div className="mb-1 text-2xl font-bold text-white">{metric.value}</div>
            <div className={`text-sm ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
              {metric.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

