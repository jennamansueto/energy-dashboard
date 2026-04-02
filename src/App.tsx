import './App.css'
import {
  Zap,
  LayoutGrid,
  BarChart3,
  Settings,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Data

const metricCards = [
  {
    label: 'KVA',
    value: '1,245.6',
    unit: 'kVA',
    name: 'Apparent Power',
    change: '+5.2%',
    trend: 'up' as const,
    status: 'normal',
  },
  {
    label: 'KWH',
    value: '8,932.4',
    unit: 'kWh',
    name: 'Energy Consumption',
    change: '+12.8%',
    trend: 'up' as const,
    status: 'high',
  },
  {
    label: 'KVAR',
    value: '342.1',
    unit: 'kVAR',
    name: 'Reactive Power',
    change: '-2.1%',
    trend: 'down' as const,
    status: 'normal',
  },
  {
    label: 'PF',
    value: '0.92',
    unit: '',
    name: 'Power Factor',
    change: '0.0%',
    trend: 'flat' as const,
    status: 'optimal',
  },
]

const pieData = [
  { name: 'Device 1 - Main Building', value: 4800, color: '#22C55E' },
  { name: 'Device 2 - Manufacturing', value: 3600, color: '#86EFAC' },
  { name: 'Device 3 - Office Block', value: 2800, color: '#166534' },
  { name: 'HVAC Systems', value: 2200, color: '#14532D' },
  { name: 'Lighting', value: 1200, color: '#365314' },
  { name: 'Equipment', value: 817, color: '#1A1A1A' },
]

const deviceStatus = [
  { device: 'Device 1 - Main Building', status: 'Online', consumption: '4,800 kWh' },
  { device: 'Device 2 - Manufacturing', status: 'Online', consumption: '3,600 kWh' },
  { device: 'Device 3 - Office Block', status: 'Idle', consumption: '2,800 kWh' },
]

const demandData = [
  { time: '02:00', actual: 750, max: 1200 },
  { time: '04:00', actual: 650, max: 1200 },
  { time: '06:00', actual: 820, max: 1200 },
  { time: '08:00', actual: 980, max: 1200 },
  { time: '10:00', actual: 1050, max: 1200 },
  { time: '12:00', actual: 1100, max: 1200 },
  { time: '14:00', actual: 1350, max: 1200 },
  { time: '16:00', actual: 1280, max: 1200 },
  { time: '18:00', actual: 1300, max: 1200 },
  { time: '20:00', actual: 1180, max: 1200 },
  { time: '22:00', actual: 1050, max: 1200 },
]

const demandAnalysis = [
  { label: 'Peak Demand Time', value: '14:00 (1350 kW)' },
  { label: 'Low Demand Time', value: '04:00 (650 kW)' },
  { label: 'Demand Variance', value: '700 kW (58.3%)' },
]

const demandStats = [
  { value: '1058 kW', label: 'Avg Demand' },
  { value: '1350 kW', label: 'Peak Demand' },
  { value: '88%', label: 'Efficiency' },
]

// Sidebar

const navItems = [
  { icon: Zap, active: true },
  { icon: LayoutGrid, active: false },
  { icon: BarChart3, active: false },
  { icon: Settings, active: false },
  { icon: FileText, active: false },
  { icon: User, active: false },
]

function Sidebar() {
  return (
    <div className="flex flex-col items-center justify-between py-5 w-[70px] min-h-screen bg-[#F1F5F4]">
      <nav className="flex flex-col items-center gap-2">
        {navItems.map((item, i) => {
          const Icon = item.icon
          return (
            <button
              key={i}
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${
                item.active
                  ? 'bg-[#7BDC93] text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.active && (
                <span className="absolute -left-[3px] w-1 h-6 bg-[#7BDC93] rounded-r-full" />
              )}
            </button>
          )
        })}
      </nav>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#D1FAE5]">
          <span className="text-sm font-semibold text-[#2C5F4E]">LG</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}

// Metric Card

function MetricCard({
  card,
}: {
  card: (typeof metricCards)[number]
}) {
  const TrendIcon =
    card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus

  const changeColor =
    card.trend === 'up'
      ? 'text-[#7BDC93]'
      : card.trend === 'down'
        ? 'text-[#FF6467]'
        : 'text-white'

  return (
    <div className="flex-1 rounded-xl bg-gradient-to-br from-[#2C5F4E] to-[#1A3A2E] p-4 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-white/90 tracking-wide">{card.label}</span>
        <span
          className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
          style={{ color: '#2C5F4E', backgroundColor: '#7BDC93' }}
        >
          {card.status}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-xl font-bold text-white">{card.value}</span>
        {card.unit && <span className="text-xs text-white/70">{card.unit}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/70">{card.name}</span>
        <div className={`flex items-center gap-0.5 ${changeColor}`}>
          <TrendIcon size={12} />
          <span className="text-[10px]">{card.change}</span>
        </div>
      </div>
    </div>
  )
}

// Pie Chart Legend Item

function PieLegendItem({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-gray-600 whitespace-nowrap">{name}</span>
    </div>
  )
}

// Device Status Row

function DeviceStatusRow({
  device,
  consumption,
}: {
  device: string
  status: string
  consumption: string
}) {
  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-[#F1F5F4]/50">
      <span className="text-xs text-gray-800">{device}</span>
      <span className="text-xs font-medium text-gray-800">{consumption}</span>
    </div>
  )
}

// Demand Analysis Row

function DemandAnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-[#F1F5F4]/50">
      <span className="text-xs text-gray-800">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  )
}

// Main App

function App() {
  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-['Inter']">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Hello, Liam Gallagher! &#x1F44B;
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">What are you looking for today?</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-medium text-green-500">
                Real-time monitoring active
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            {metricCards.map((card, i) => (
              <MetricCard key={i} card={card} />
            ))}
          </div>

          <div className="flex gap-5">
            <div className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Energy Consumption Overview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribution of energy consumption across all live devices for today
                </p>
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-900">15,417</p>
                <p className="text-xs text-gray-500">Total kWh consumption</p>
              </div>

              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={280} height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} kWh`, '']}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mb-5">
                {pieData.map((item, i) => (
                  <PieLegendItem key={i} color={item.color} name={item.name} />
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Device Status</h3>
                <div className="space-y-1.5">
                  {deviceStatus.map((d, i) => (
                    <DeviceStatusRow key={i} {...d} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Max vs Actual Demand</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparison of peak demand against actual usage over time (real-time)
                </p>
              </div>

              <div className="flex gap-4 mb-4">
                {demandStats.map((stat, i) => (
                  <div key={i} className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={demandData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      axisLine={{ stroke: '#1A1A1A' }}
                      tickLine={{ stroke: '#1A1A1A' }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      axisLine={{ stroke: '#1A1A1A' }}
                      tickLine={{ stroke: '#1A1A1A' }}
                      ticks={[0, 350, 700, 1050, 1400]}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value} kW`,
                        name === 'max' ? 'Max Demand' : 'Actual Demand',
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      formatter={(value: string) =>
                        value === 'max' ? 'Max Demand' : 'Actual Demand'
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="max"
                      stroke="#FF6467"
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#FF6467' }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#22C55E"
                      dot={{ r: 4, fill: '#22C55E' }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Demand Analysis</h3>
                <div className="space-y-1.5">
                  {demandAnalysis.map((d, i) => (
                    <DemandAnalysisRow key={i} {...d} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
