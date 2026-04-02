import { useState } from 'react'
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
  SlidersHorizontal,
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

// Filter options

const filterTypes = [
  { value: 'all', label: 'All Devices' },
  { value: 'individual', label: 'Individual Device' },
]

const devices = [
  { value: 'all', label: 'All Devices', zone: '' },
  { value: 'device-1', label: 'Main Building - Floor 1', zone: 'Building A' },
  { value: 'device-2', label: 'Manufacturing - Zone 3', zone: 'Building B' },
  { value: 'device-3', label: 'Office Block - Floor 2', zone: 'Building C' },
]

const dataModes = [
  { value: 'real-time', label: 'Real-Time' },
  { value: 'historical', label: 'Historical' },
]

const timePeriods = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
]

interface FilterState {
  filterType: string
  device: string
  dataMode: string
  timePeriod: string
}

const defaultFilters: FilterState = {
  filterType: 'all',
  device: 'all',
  dataMode: 'real-time',
  timePeriod: 'today',
}

// Data

const allMetricCards = [
  {
    label: 'KVA',
    value: '1,245.6',
    unit: 'kVA',
    name: 'Apparent Power',
    change: '+5.2%',
    trend: 'up' as const,
    status: 'normal',
    deviceValues: { 'device-1': '620.3', 'device-2': '412.1', 'device-3': '213.2' },
  },
  {
    label: 'KWH',
    value: '8,932.4',
    unit: 'kWh',
    name: 'Energy Consumption',
    change: '+12.8%',
    trend: 'up' as const,
    status: 'high',
    deviceValues: { 'device-1': '4,800.0', 'device-2': '2,532.4', 'device-3': '1,600.0' },
  },
  {
    label: 'KVAR',
    value: '342.1',
    unit: 'kVAR',
    name: 'Reactive Power',
    change: '-2.1%',
    trend: 'down' as const,
    status: 'normal',
    deviceValues: { 'device-1': '171.0', 'device-2': '114.1', 'device-3': '57.0' },
  },
  {
    label: 'PF',
    value: '0.92',
    unit: '',
    name: 'Power Factor',
    change: '0.0%',
    trend: 'flat' as const,
    status: 'optimal',
    deviceValues: { 'device-1': '0.94', 'device-2': '0.91', 'device-3': '0.89' },
  },
]

type MetricCardData = {
  label: string
  value: string
  unit: string
  name: string
  change: string
  trend: 'up' | 'down' | 'flat'
  status: string
}

const allPieData = [
  { name: 'Device 1 - Main Building', value: 4800, color: '#22C55E', device: 'device-1' },
  { name: 'Device 2 - Manufacturing', value: 3600, color: '#86EFAC', device: 'device-2' },
  { name: 'Device 3 - Office Block', value: 2800, color: '#166534', device: 'device-3' },
  { name: 'HVAC Systems', value: 2200, color: '#14532D', device: 'device-1' },
  { name: 'Lighting', value: 1200, color: '#365314', device: 'device-2' },
  { name: 'Equipment', value: 817, color: '#1A1A1A', device: 'device-3' },
]


const allDeviceStatus = [
  { device: 'Device 1 - Main Building', status: 'Online', consumption: '4,800 kWh', deviceId: 'device-1' },
  { device: 'Device 2 - Manufacturing', status: 'Online', consumption: '3,600 kWh', deviceId: 'device-2' },
  { device: 'Device 3 - Office Block', status: 'Idle', consumption: '2,800 kWh', deviceId: 'device-3' },
]


const allDemandData: Record<string, { time: string; actual: number; max: number }[]> = {
  'all': [
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
  ],
  'device-1': [
    { time: '02:00', actual: 380, max: 600 },
    { time: '04:00', actual: 320, max: 600 },
    { time: '06:00', actual: 410, max: 600 },
    { time: '08:00', actual: 490, max: 600 },
    { time: '10:00', actual: 530, max: 600 },
    { time: '12:00', actual: 550, max: 600 },
    { time: '14:00', actual: 680, max: 600 },
    { time: '16:00', actual: 640, max: 600 },
    { time: '18:00', actual: 650, max: 600 },
    { time: '20:00', actual: 590, max: 600 },
    { time: '22:00', actual: 530, max: 600 },
  ],
  'device-2': [
    { time: '02:00', actual: 220, max: 400 },
    { time: '04:00', actual: 190, max: 400 },
    { time: '06:00', actual: 240, max: 400 },
    { time: '08:00', actual: 290, max: 400 },
    { time: '10:00', actual: 310, max: 400 },
    { time: '12:00', actual: 330, max: 400 },
    { time: '14:00', actual: 400, max: 400 },
    { time: '16:00', actual: 380, max: 400 },
    { time: '18:00', actual: 390, max: 400 },
    { time: '20:00', actual: 350, max: 400 },
    { time: '22:00', actual: 310, max: 400 },
  ],
  'device-3': [
    { time: '02:00', actual: 150, max: 300 },
    { time: '04:00', actual: 140, max: 300 },
    { time: '06:00', actual: 170, max: 300 },
    { time: '08:00', actual: 200, max: 300 },
    { time: '10:00', actual: 210, max: 300 },
    { time: '12:00', actual: 220, max: 300 },
    { time: '14:00', actual: 270, max: 300 },
    { time: '16:00', actual: 260, max: 300 },
    { time: '18:00', actual: 260, max: 300 },
    { time: '20:00', actual: 240, max: 300 },
    { time: '22:00', actual: 210, max: 300 },
  ],
}


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
  card: MetricCardData
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
  status,
  consumption,
}: {
  device: string
  status: string
  consumption: string
}) {
  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-[#F1F5F4]/50">
      <span className="text-xs text-gray-800">{device}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>{status}</span>
        <span className="text-xs font-medium text-gray-800">{consumption}</span>
      </div>
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

// Filter Bar

function FilterBar({
  filters,
  onChange,
  onApply,
}: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onApply: () => void
}) {
  const showDeviceSelector = filters.filterType === 'individual'

  return (
    <div className="bg-white/80 border border-gray-200/30 rounded-xl shadow-sm px-5 py-4">
      <div className="flex items-end gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Filter Type</label>
          <select
            value={filters.filterType}
            onChange={(e) => {
              const newFilterType = e.target.value
              onChange({
                ...filters,
                filterType: newFilterType,
                device: newFilterType === 'all' ? 'all' : (filters.device === 'all' ? 'device-1' : filters.device),
              })
            }}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 cursor-pointer"
          >
            {filterTypes.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>

        {showDeviceSelector && (
          <div className="flex-[1.5] min-w-0">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Device</label>
            <select
              value={filters.device}
              onChange={(e) => onChange({ ...filters, device: e.target.value })}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 cursor-pointer"
            >
              {devices
                .filter((d) => d.value !== 'all')
                .map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}{d.zone ? `, ${d.zone}` : ''}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Data Mode</label>
          <select
            value={filters.dataMode}
            onChange={(e) => onChange({ ...filters, dataMode: e.target.value })}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 cursor-pointer"
          >
            {dataModes.map((dm) => (
              <option key={dm.value} value={dm.value}>
                {dm.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Time Period</label>
          <select
            value={filters.timePeriod}
            onChange={(e) => onChange({ ...filters, timePeriod: e.target.value })}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 cursor-pointer"
          >
            {timePeriods.map((tp) => (
              <option key={tp.value} value={tp.value}>
                {tp.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onApply}
          className="flex items-center gap-2 px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal size={16} />
          Apply Filter
        </button>
      </div>
    </div>
  )
}

// Helper: compute filtered data

function getFilteredData(appliedFilters: FilterState) {
  const deviceKey = appliedFilters.filterType === 'individual' ? appliedFilters.device : 'all'

  const filteredMetricCards = allMetricCards.map((card) => {
    if (deviceKey === 'all') {
      return {
        label: card.label,
        value: card.value,
        unit: card.unit,
        name: card.name,
        change: card.change,
        trend: card.trend,
        status: card.status,
      }
    }
    return {
      label: card.label,
      value: card.deviceValues[deviceKey as keyof typeof card.deviceValues] ?? card.value,
      unit: card.unit,
      name: card.name,
      change: card.change,
      trend: card.trend,
      status: card.status,
    }
  })

  const filteredPieData =
    deviceKey === 'all'
      ? allPieData.map(({ name, value, color }) => ({ name, value, color }))
      : allPieData
          .filter((item) => item.device === deviceKey)
          .map(({ name, value, color }) => ({ name, value, color }))

  const filteredDeviceStatus =
    deviceKey === 'all'
      ? allDeviceStatus.map(({ device, status, consumption }) => ({ device, status, consumption }))
      : allDeviceStatus
          .filter((d) => d.deviceId === deviceKey)
          .map(({ device, status, consumption }) => ({ device, status, consumption }))

  const filteredDemandData = allDemandData[deviceKey] ?? allDemandData['all']

  const totalConsumption = filteredPieData.reduce((sum, item) => sum + item.value, 0)

  const actualValues = filteredDemandData.map((d) => d.actual)
  const avgDemand = Math.round(actualValues.reduce((a, b) => a + b, 0) / actualValues.length)
  const peakDemand = Math.max(...actualValues)
  const maxCapacity = Math.max(...filteredDemandData.map((d) => d.max))
  const efficiency = Math.round((avgDemand / maxCapacity) * 100)

  const peakTime = filteredDemandData.reduce((prev, curr) =>
    curr.actual > prev.actual ? curr : prev
  )
  const lowTime = filteredDemandData.reduce((prev, curr) =>
    curr.actual < prev.actual ? curr : prev
  )
  const variance = peakDemand - Math.min(...actualValues)
  const variancePct = ((variance / maxCapacity) * 100).toFixed(1)

  const filteredDemandStats = [
    { value: `${avgDemand} kW`, label: 'Avg Demand' },
    { value: `${peakDemand} kW`, label: 'Peak Demand' },
    { value: `${efficiency}%`, label: 'Efficiency' },
  ]

  const filteredDemandAnalysis = [
    { label: 'Peak Demand Time', value: `${peakTime.time} (${peakTime.actual} kW)` },
    { label: 'Low Demand Time', value: `${lowTime.time} (${lowTime.actual} kW)` },
    { label: 'Demand Variance', value: `${variance} kW (${variancePct}%)` },
  ]

  return {
    filteredMetricCards,
    filteredPieData,
    filteredDeviceStatus,
    filteredDemandData,
    filteredDemandStats,
    filteredDemandAnalysis,
    totalConsumption,
  }
}

// Main App

function App() {
  const [pendingFilters, setPendingFilters] = useState<FilterState>({ ...defaultFilters })
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({ ...defaultFilters })

  const handleApplyFilter = () => {
    setAppliedFilters({ ...pendingFilters })
  }

  const {
    filteredMetricCards: currentMetricCards,
    filteredPieData: currentPieData,
    filteredDeviceStatus: currentDeviceStatus,
    filteredDemandData: currentDemandData,
    filteredDemandStats: currentDemandStats,
    filteredDemandAnalysis: currentDemandAnalysis,
    totalConsumption,
  } = getFilteredData(appliedFilters)

  const timePeriodLabel = timePeriods.find((tp) => tp.value === appliedFilters.timePeriod)?.label ?? 'today'
  const dataModeLabel = dataModes.find((dm) => dm.value === appliedFilters.dataMode)?.label ?? 'real-time'

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans">
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

          <FilterBar
            filters={pendingFilters}
            onChange={setPendingFilters}
            onApply={handleApplyFilter}
          />

          <div className="flex gap-4">
            {currentMetricCards.map((card, i) => (
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
                  Distribution of energy consumption across {appliedFilters.filterType === 'individual' ? 'selected device' : 'all live devices'} for {timePeriodLabel.toLowerCase()}
                </p>
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-900">{totalConsumption.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total kWh consumption</p>
              </div>

              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={280} height={220}>
                  <PieChart>
                    <Pie
                      data={currentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {currentPieData.map((entry, index) => (
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
                {currentPieData.map((item, i) => (
                  <PieLegendItem key={i} color={item.color} name={item.name} />
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Device Status</h3>
                <div className="space-y-1.5">
                  {currentDeviceStatus.map((d, i) => (
                    <DeviceStatusRow key={i} {...d} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Max vs Actual Demand</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparison of peak demand against actual usage over time ({dataModeLabel.toLowerCase()})
                </p>
              </div>

              <div className="flex gap-4 mb-4">
                {currentDemandStats.map((stat, i) => (
                  <div key={i} className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={currentDemandData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                  {currentDemandAnalysis.map((d, i) => (
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
