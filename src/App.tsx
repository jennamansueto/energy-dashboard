import { useState, useMemo } from 'react'
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
  ChevronDown,
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

// Types

interface DeviceData {
  id: string
  name: string
  location: string
  status: 'Online' | 'Idle' | 'Offline'
  metrics: {
    kva: number
    kwh: number
    kvar: number
    pf: number
    kvaChange: number
    kwhChange: number
    kvarChange: number
    pfChange: number
  }
  pieValue: number
  pieColor: string
  demandData: { time: string; actual: number; max: number }[]
}

interface Filters {
  filterType: string
  device: string
  dataMode: string
  timePeriod: string
}

// Device database

const devices: DeviceData[] = [
  {
    id: 'device-1',
    name: 'Main Building - Floor 1',
    location: 'Building A',
    status: 'Online',
    metrics: {
      kva: 524.3, kwh: 4800, kvar: 142.5, pf: 0.95,
      kvaChange: 3.1, kwhChange: 8.2, kvarChange: -1.5, pfChange: 0.0,
    },
    pieValue: 4800,
    pieColor: '#22C55E',
    demandData: [
      { time: '02:00', actual: 320, max: 550 },
      { time: '04:00', actual: 280, max: 550 },
      { time: '06:00', actual: 350, max: 550 },
      { time: '08:00', actual: 420, max: 550 },
      { time: '10:00', actual: 460, max: 550 },
      { time: '12:00', actual: 490, max: 550 },
      { time: '14:00', actual: 580, max: 550 },
      { time: '16:00', actual: 540, max: 550 },
      { time: '18:00', actual: 560, max: 550 },
      { time: '20:00', actual: 500, max: 550 },
      { time: '22:00', actual: 440, max: 550 },
    ],
  },
  {
    id: 'device-2',
    name: 'Manufacturing',
    location: 'Building B',
    status: 'Online',
    metrics: {
      kva: 482.1, kwh: 3600, kvar: 128.4, pf: 0.89,
      kvaChange: 6.8, kwhChange: 15.3, kvarChange: -3.2, pfChange: -0.1,
    },
    pieValue: 3600,
    pieColor: '#86EFAC',
    demandData: [
      { time: '02:00', actual: 280, max: 420 },
      { time: '04:00', actual: 240, max: 420 },
      { time: '06:00', actual: 310, max: 420 },
      { time: '08:00', actual: 380, max: 420 },
      { time: '10:00', actual: 400, max: 420 },
      { time: '12:00', actual: 410, max: 420 },
      { time: '14:00', actual: 520, max: 420 },
      { time: '16:00', actual: 490, max: 420 },
      { time: '18:00', actual: 500, max: 420 },
      { time: '20:00', actual: 440, max: 420 },
      { time: '22:00', actual: 390, max: 420 },
    ],
  },
  {
    id: 'device-3',
    name: 'Office Block',
    location: 'Building C',
    status: 'Idle',
    metrics: {
      kva: 239.2, kwh: 2800, kvar: 71.2, pf: 0.93,
      kvaChange: 2.4, kwhChange: 6.1, kvarChange: -0.8, pfChange: 0.1,
    },
    pieValue: 2800,
    pieColor: '#166534',
    demandData: [
      { time: '02:00', actual: 150, max: 230 },
      { time: '04:00', actual: 130, max: 230 },
      { time: '06:00', actual: 160, max: 230 },
      { time: '08:00', actual: 180, max: 230 },
      { time: '10:00', actual: 190, max: 230 },
      { time: '12:00', actual: 200, max: 230 },
      { time: '14:00', actual: 250, max: 230 },
      { time: '16:00', actual: 250, max: 230 },
      { time: '18:00', actual: 240, max: 230 },
      { time: '20:00', actual: 240, max: 230 },
      { time: '22:00', actual: 220, max: 230 },
    ],
  },
]

const supplementaryPieData = [
  { name: 'HVAC Systems', value: 2200, color: '#14532D' },
  { name: 'Lighting', value: 1200, color: '#365314' },
  { name: 'Equipment', value: 817, color: '#1A1A1A' },
]

const filterTypeOptions = [
  { value: 'all', label: 'All Devices' },
  { value: 'individual', label: 'Individual Device' },
]

const dataModeOptions = [
  { value: 'real-time', label: 'Real-Time' },
  { value: 'historical', label: 'Historical' },
]

const timePeriodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
]

function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

function formatChange(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function getTrend(n: number): 'up' | 'down' | 'flat' {
  if (n > 0) return 'up'
  if (n < 0) return 'down'
  return 'flat'
}

function computeDashboardData(activeDevices: DeviceData[], timePeriod: string) {
  const totalKva = activeDevices.reduce((sum, d) => sum + d.metrics.kva, 0)
  const totalKwh = activeDevices.reduce((sum, d) => sum + d.metrics.kwh, 0)
  const totalKvar = activeDevices.reduce((sum, d) => sum + d.metrics.kvar, 0)
  const avgPf = activeDevices.length > 0
    ? activeDevices.reduce((sum, d) => sum + d.metrics.pf, 0) / activeDevices.length
    : 0

  const avgKvaChange = activeDevices.length > 0
    ? activeDevices.reduce((sum, d) => sum + d.metrics.kvaChange, 0) / activeDevices.length
    : 0
  const avgKwhChange = activeDevices.length > 0
    ? activeDevices.reduce((sum, d) => sum + d.metrics.kwhChange, 0) / activeDevices.length
    : 0
  const avgKvarChange = activeDevices.length > 0
    ? activeDevices.reduce((sum, d) => sum + d.metrics.kvarChange, 0) / activeDevices.length
    : 0
  const avgPfChange = activeDevices.length > 0
    ? activeDevices.reduce((sum, d) => sum + d.metrics.pfChange, 0) / activeDevices.length
    : 0

  const timePeriodMultiplier = timePeriod === 'this-week' ? 7 : timePeriod === 'this-month' ? 30 : 1

  const metricCards = [
    {
      label: 'KVA',
      value: formatNumber(totalKva * timePeriodMultiplier),
      unit: 'kVA',
      name: 'Apparent Power',
      change: formatChange(avgKvaChange),
      trend: getTrend(avgKvaChange),
      status: 'normal',
    },
    {
      label: 'KWH',
      value: formatNumber(totalKwh * timePeriodMultiplier),
      unit: 'kWh',
      name: 'Energy Consumption',
      change: formatChange(avgKwhChange),
      trend: getTrend(avgKwhChange),
      status: 'high',
    },
    {
      label: 'KVAR',
      value: formatNumber(totalKvar * timePeriodMultiplier),
      unit: 'kVAR',
      name: 'Reactive Power',
      change: formatChange(avgKvarChange),
      trend: getTrend(avgKvarChange),
      status: 'normal',
    },
    {
      label: 'PF',
      value: avgPf.toFixed(2),
      unit: '',
      name: 'Power Factor',
      change: formatChange(avgPfChange),
      trend: getTrend(avgPfChange),
      status: 'optimal',
    },
  ]

  const pieData = activeDevices.map((d) => ({
    name: `${d.id === 'device-1' ? 'Device 1' : d.id === 'device-2' ? 'Device 2' : 'Device 3'} - ${d.name}`,
    value: d.pieValue * timePeriodMultiplier,
    color: d.pieColor,
  }))

  const showSupplementary = activeDevices.length > 1
  if (showSupplementary) {
    pieData.push(
      ...supplementaryPieData.map((s) => ({
        ...s,
        value: s.value * timePeriodMultiplier,
      }))
    )
  }

  const totalConsumption = pieData.reduce((sum, d) => sum + d.value, 0)

  const deviceStatusList = activeDevices.map((d) => ({
    device: `${d.id === 'device-1' ? 'Device 1' : d.id === 'device-2' ? 'Device 2' : 'Device 3'} - ${d.name}`,
    status: d.status,
    consumption: `${formatNumber(d.metrics.kwh * timePeriodMultiplier)} kWh`,
  }))

  const timePoints = activeDevices[0]?.demandData.map((d) => d.time) ?? []
  const demandData = timePoints.map((time, i) => {
    const actual = activeDevices.reduce((sum, d) => sum + (d.demandData[i]?.actual ?? 0), 0)
    const max = activeDevices.reduce((sum, d) => sum + (d.demandData[i]?.max ?? 0), 0)
    return { time, actual, max }
  })

  const actualValues = demandData.map((d) => d.actual)
  const peakDemand = Math.max(...actualValues, 0)
  const lowDemand = Math.min(...actualValues, Infinity === Math.min(...actualValues) ? 0 : Infinity)
  const avgDemand = actualValues.length > 0
    ? Math.round(actualValues.reduce((a, b) => a + b, 0) / actualValues.length)
    : 0
  const peakTime = demandData.find((d) => d.actual === peakDemand)?.time ?? ''
  const lowTime = demandData.find((d) => d.actual === lowDemand)?.time ?? ''
  const variance = peakDemand - lowDemand
  const variancePct = peakDemand > 0 ? ((variance / peakDemand) * 100).toFixed(1) : '0.0'
  const maxDemandVal = Math.max(...demandData.map((d) => d.max), 0)
  const efficiency = maxDemandVal > 0 ? Math.round((avgDemand / maxDemandVal) * 100) : 0

  const demandAnalysis = [
    { label: 'Peak Demand Time', value: `${peakTime} (${peakDemand} kW)` },
    { label: 'Low Demand Time', value: `${lowTime} (${lowDemand} kW)` },
    { label: 'Demand Variance', value: `${variance} kW (${variancePct}%)` },
  ]

  const demandStats = [
    { value: `${avgDemand} kW`, label: 'Avg Demand' },
    { value: `${peakDemand} kW`, label: 'Peak Demand' },
    { value: `${efficiency}%`, label: 'Efficiency' },
  ]

  return {
    metricCards,
    pieData,
    totalConsumption: formatNumber(totalConsumption),
    deviceStatusList,
    demandData,
    demandAnalysis,
    demandStats,
  }
}

// Default (unfiltered) data

const defaultMetricCards = [
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

const defaultPieData = [
  { name: 'Device 1 - Main Building', value: 4800, color: '#22C55E' },
  { name: 'Device 2 - Manufacturing', value: 3600, color: '#86EFAC' },
  { name: 'Device 3 - Office Block', value: 2800, color: '#166534' },
  { name: 'HVAC Systems', value: 2200, color: '#14532D' },
  { name: 'Lighting', value: 1200, color: '#365314' },
  { name: 'Equipment', value: 817, color: '#1A1A1A' },
]

const defaultDeviceStatus = [
  { device: 'Device 1 - Main Building', status: 'Online', consumption: '4,800 kWh' },
  { device: 'Device 2 - Manufacturing', status: 'Online', consumption: '3,600 kWh' },
  { device: 'Device 3 - Office Block', status: 'Idle', consumption: '2,800 kWh' },
]

const defaultDemandData = [
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

const defaultDemandAnalysis = [
  { label: 'Peak Demand Time', value: '14:00 (1350 kW)' },
  { label: 'Low Demand Time', value: '04:00 (650 kW)' },
  { label: 'Demand Variance', value: '700 kW (58.3%)' },
]

const defaultDemandStats = [
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

// Filter Bar

function FilterBar({
  filters,
  onChange,
  onApply,
}: {
  filters: Filters
  onChange: (updates: Partial<Filters>) => void
  onApply: () => void
}) {
  return (
    <div className="bg-white/80 border border-gray-200/30 rounded-xl shadow-sm px-[18px] py-[18px]">
      <div className="flex items-end gap-3.5">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Filter Type
          </label>
          <div className="relative">
            <select
              value={filters.filterType}
              onChange={(e) => onChange({ filterType: e.target.value })}
              className="appearance-none w-full bg-[#F8FAF9]/50 border border-[#E5E7EB]/50 rounded-[7px] px-2.5 py-[7px] pr-8 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              {filterTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400/50 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex-[1.6] min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select Device
          </label>
          <div className="relative">
            <select
              value={filters.device}
              onChange={(e) => onChange({ device: e.target.value })}
              disabled={filters.filterType === 'all'}
              className="appearance-none w-full bg-[#F8FAF9]/50 border border-[#E5E7EB]/50 rounded-[7px] px-2.5 py-[7px] pr-8 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All Devices</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {`\u25CF  ${d.name}, ${d.location}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400/50 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Data Mode
          </label>
          <div className="relative">
            <select
              value={filters.dataMode}
              onChange={(e) => onChange({ dataMode: e.target.value })}
              className="appearance-none w-full bg-[#F8FAF9]/50 border border-[#E5E7EB]/50 rounded-[7px] px-2.5 py-[7px] pr-8 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              {dataModeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400/50 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Time Period
          </label>
          <div className="relative">
            <select
              value={filters.timePeriod}
              onChange={(e) => onChange({ timePeriod: e.target.value })}
              className="appearance-none w-full bg-[#F8FAF9]/50 border border-[#E5E7EB]/50 rounded-[7px] px-2.5 py-[7px] pr-8 text-xs font-medium text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              {timePeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400/50 pointer-events-none"
            />
          </div>
        </div>

        <button
          onClick={onApply}
          className="flex items-center gap-2 px-5 py-[9px] bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-medium rounded-[7px] shadow-sm transition-colors whitespace-nowrap"
        >
          <SlidersHorizontal size={14} />
          Apply Filter
        </button>
      </div>
    </div>
  )
}

// Metric Card

function MetricCard({
  card,
}: {
  card: typeof defaultMetricCards[number]
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

// Main App

function App() {
  const [filters, setFilters] = useState<Filters>({
    filterType: 'all',
    device: 'all',
    dataMode: 'real-time',
    timePeriod: 'today',
  })

  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    filterType: 'all',
    device: 'all',
    dataMode: 'real-time',
    timePeriod: 'today',
  })

  const handleFilterChange = (updates: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates }
      if (updates.filterType === 'all') {
        next.device = 'all'
      }
      return next
    })
  }

  const handleApplyFilter = () => {
    setAppliedFilters({ ...filters })
  }

  const isDefaultState =
    appliedFilters.filterType === 'all' &&
    appliedFilters.device === 'all' &&
    appliedFilters.dataMode === 'real-time' &&
    appliedFilters.timePeriod === 'today'

  const dashboardData = useMemo(() => {
    if (isDefaultState) return null

    const activeDevices =
      appliedFilters.filterType === 'individual' && appliedFilters.device !== 'all'
        ? devices.filter((d) => d.id === appliedFilters.device)
        : devices

    return computeDashboardData(activeDevices, appliedFilters.timePeriod)
  }, [appliedFilters, isDefaultState])

  const metricCards = isDefaultState ? defaultMetricCards : dashboardData!.metricCards
  const pieData = isDefaultState ? defaultPieData : dashboardData!.pieData
  const totalConsumption = isDefaultState ? '15,417' : dashboardData!.totalConsumption
  const deviceStatusData = isDefaultState ? defaultDeviceStatus : dashboardData!.deviceStatusList
  const demandData = isDefaultState ? defaultDemandData : dashboardData!.demandData
  const demandAnalysis = isDefaultState ? defaultDemandAnalysis : dashboardData!.demandAnalysis
  const demandStats = isDefaultState ? defaultDemandStats : dashboardData!.demandStats

  const dataModeLabel = appliedFilters.dataMode === 'real-time' ? 'real-time' : 'historical'
  const timePeriodLabel =
    appliedFilters.timePeriod === 'today'
      ? 'today'
      : appliedFilters.timePeriod === 'this-week'
        ? 'this week'
        : 'this month'

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
            filters={filters}
            onChange={handleFilterChange}
            onApply={handleApplyFilter}
          />

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
                  Distribution of energy consumption across all live devices for {timePeriodLabel}
                </p>
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-900">{totalConsumption}</p>
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
                  {deviceStatusData.map((d, i) => (
                    <DeviceStatusRow key={i} {...d} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">Max vs Actual Demand</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparison of peak demand against actual usage over time ({dataModeLabel})
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
