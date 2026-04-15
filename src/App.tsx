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
  Filter,
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
  consumption: number
  kva: number
  kvar: number
  pf: number
  demandData: { time: string; actual: number; max: number }[]
}

interface FilterState {
  filterType: string
  device: string
  dataMode: string
  timePeriod: string
}

// Device database with per-device metrics

const devices: DeviceData[] = [
  {
    id: 'device-1',
    name: 'Main Building - Floor 1',
    location: 'Building A',
    status: 'Online',
    consumption: 4800,
    kva: 520.3,
    kvar: 142.8,
    pf: 0.94,
    demandData: [
      { time: '02:00', actual: 320, max: 600 },
      { time: '04:00', actual: 280, max: 600 },
      { time: '06:00', actual: 350, max: 600 },
      { time: '08:00', actual: 420, max: 600 },
      { time: '10:00', actual: 460, max: 600 },
      { time: '12:00', actual: 480, max: 600 },
      { time: '14:00', actual: 560, max: 600 },
      { time: '16:00', actual: 530, max: 600 },
      { time: '18:00', actual: 540, max: 600 },
      { time: '20:00', actual: 490, max: 600 },
      { time: '22:00', actual: 440, max: 600 },
    ],
  },
  {
    id: 'device-2',
    name: 'Manufacturing Wing',
    location: 'Building B',
    status: 'Online',
    consumption: 3600,
    kva: 412.1,
    kvar: 118.5,
    pf: 0.91,
    demandData: [
      { time: '02:00', actual: 250, max: 500 },
      { time: '04:00', actual: 210, max: 500 },
      { time: '06:00', actual: 280, max: 500 },
      { time: '08:00', actual: 340, max: 500 },
      { time: '10:00', actual: 370, max: 500 },
      { time: '12:00', actual: 390, max: 500 },
      { time: '14:00', actual: 480, max: 500 },
      { time: '16:00', actual: 450, max: 500 },
      { time: '18:00', actual: 460, max: 500 },
      { time: '20:00', actual: 410, max: 500 },
      { time: '22:00', actual: 370, max: 500 },
    ],
  },
  {
    id: 'device-3',
    name: 'Office Block',
    location: 'Building C',
    status: 'Idle',
    consumption: 2800,
    kva: 313.2,
    kvar: 80.8,
    pf: 0.90,
    demandData: [
      { time: '02:00', actual: 180, max: 400 },
      { time: '04:00', actual: 160, max: 400 },
      { time: '06:00', actual: 190, max: 400 },
      { time: '08:00', actual: 220, max: 400 },
      { time: '10:00', actual: 220, max: 400 },
      { time: '12:00', actual: 230, max: 400 },
      { time: '14:00', actual: 310, max: 400 },
      { time: '16:00', actual: 300, max: 400 },
      { time: '18:00', actual: 300, max: 400 },
      { time: '20:00', actual: 280, max: 400 },
      { time: '22:00', actual: 240, max: 400 },
    ],
  },
]

const pieColors = ['#22C55E', '#86EFAC', '#166534', '#14532D', '#365314', '#1A1A1A']

const allPieData = [
  { name: 'Device 1 - Main Building', value: 4800, color: '#22C55E' },
  { name: 'Device 2 - Manufacturing', value: 3600, color: '#86EFAC' },
  { name: 'Device 3 - Office Block', value: 2800, color: '#166534' },
  { name: 'HVAC Systems', value: 2200, color: '#14532D' },
  { name: 'Lighting', value: 1200, color: '#365314' },
  { name: 'Equipment', value: 817, color: '#1A1A1A' },
]

const allDeviceStatus = [
  { device: 'Device 1 - Main Building', status: 'Online', consumption: '4,800 kWh' },
  { device: 'Device 2 - Manufacturing', status: 'Online', consumption: '3,600 kWh' },
  { device: 'Device 3 - Office Block', status: 'Idle', consumption: '2,800 kWh' },
]

const allDemandData = [
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

const allMetricCards = [
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

// Filter options

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

// Helper to compute metrics for a single device

function getDeviceMetrics(device: DeviceData) {
  const totalConsumption = device.consumption
  const demandValues = device.demandData.map((d) => d.actual)
  const peakDemand = Math.max(...demandValues)
  const avgDemand = Math.round(demandValues.reduce((a, b) => a + b, 0) / demandValues.length)
  const maxCapacity = device.demandData[0].max
  const efficiency = Math.round((avgDemand / maxCapacity) * 100)
  const peakTime = device.demandData.find((d) => d.actual === peakDemand)?.time ?? ''
  const lowDemand = Math.min(...demandValues)
  const lowTime = device.demandData.find((d) => d.actual === lowDemand)?.time ?? ''
  const variance = peakDemand - lowDemand
  const variancePct = ((variance / lowDemand) * 100).toFixed(1)

  return {
    metricCards: [
      {
        label: 'KVA',
        value: device.kva.toLocaleString(undefined, { minimumFractionDigits: 1 }),
        unit: 'kVA',
        name: 'Apparent Power',
        change: '+3.1%',
        trend: 'up' as const,
        status: 'normal',
      },
      {
        label: 'KWH',
        value: totalConsumption.toLocaleString(),
        unit: 'kWh',
        name: 'Energy Consumption',
        change: '+8.4%',
        trend: 'up' as const,
        status: totalConsumption > 4000 ? 'high' : 'normal',
      },
      {
        label: 'KVAR',
        value: device.kvar.toLocaleString(undefined, { minimumFractionDigits: 1 }),
        unit: 'kVAR',
        name: 'Reactive Power',
        change: '-1.5%',
        trend: 'down' as const,
        status: 'normal',
      },
      {
        label: 'PF',
        value: device.pf.toFixed(2),
        unit: '',
        name: 'Power Factor',
        change: '0.0%',
        trend: 'flat' as const,
        status: device.pf >= 0.92 ? 'optimal' : 'normal',
      },
    ],
    pieData: [
      { name: device.name, value: totalConsumption, color: pieColors[0] },
    ],
    deviceStatus: [
      {
        device: `Device - ${device.name}`,
        status: device.status,
        consumption: `${totalConsumption.toLocaleString()} kWh`,
      },
    ],
    demandData: device.demandData,
    demandStats: [
      { value: `${avgDemand} kW`, label: 'Avg Demand' },
      { value: `${peakDemand} kW`, label: 'Peak Demand' },
      { value: `${efficiency}%`, label: 'Efficiency' },
    ],
    demandAnalysis: [
      { label: 'Peak Demand Time', value: `${peakTime} (${peakDemand} kW)` },
      { label: 'Low Demand Time', value: `${lowTime} (${lowDemand} kW)` },
      { label: 'Demand Variance', value: `${variance} kW (${variancePct}%)` },
    ],
    totalConsumption,
  }
}

// Helper to compute metrics for all devices (default/aggregate view)

function getAllDeviceMetrics() {
  return {
    metricCards: allMetricCards,
    pieData: allPieData,
    deviceStatus: allDeviceStatus,
    demandData: allDemandData,
    demandStats: [
      { value: '1058 kW', label: 'Avg Demand' },
      { value: '1350 kW', label: 'Peak Demand' },
      { value: '88%', label: 'Efficiency' },
    ],
    demandAnalysis: [
      { label: 'Peak Demand Time', value: '14:00 (1350 kW)' },
      { label: 'Low Demand Time', value: '04:00 (650 kW)' },
      { label: 'Demand Variance', value: '700 kW (58.3%)' },
    ],
    totalConsumption: 15417,
  }
}

// Filter Bar

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  renderSelected,
}: {
  label: string
  value: string
  options: { value: string; label: string; sublabel?: string }[]
  onChange: (value: string) => void
  renderSelected?: (option: { value: string; label: string; sublabel?: string }) => React.ReactNode
}) {
  const selectedOption = options.find((o) => o.value === value)
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-[11px] font-medium text-gray-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-800 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] transition-colors"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}{option.sublabel ? ` — ${option.sublabel}` : ''}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        {renderSelected && selectedOption && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none bg-white border border-gray-200 rounded-lg">
            {renderSelected(selectedOption)}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterBar({
  filters,
  onFilterChange,
  onApply,
}: {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onApply: () => void
}) {
  const deviceOptions = [
    { value: 'all', label: 'All Devices', sublabel: '' },
    ...devices.map((d) => ({
      value: d.id,
      label: d.name,
      sublabel: d.location,
    })),
  ]

  const showDeviceSelector = filters.filterType === 'individual'

  return (
    <div className="bg-white/80 border border-gray-200/30 rounded-xl shadow-sm px-5 py-4">
      <div className="flex items-end gap-4">
        <FilterDropdown
          label="Filter Type"
          value={filters.filterType}
          options={filterTypeOptions}
          onChange={(v) => onFilterChange('filterType', v)}
        />
        {showDeviceSelector && (
          <FilterDropdown
            label="Select Device"
            value={filters.device}
            options={deviceOptions}
            onChange={(v) => onFilterChange('device', v)}
            renderSelected={(option) => {
              if (option.value === 'all') return null
              const device = devices.find((d) => d.id === option.value)
              if (!device) return null
              return (
                <span className="flex items-center gap-2 text-sm text-gray-800 truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        device.status === 'Online' ? '#22C55E' : '#9CA3AF',
                    }}
                  />
                  <span className="truncate">
                    {device.name}{' '}
                    <span className="text-gray-400">{device.location}</span>
                  </span>
                </span>
              )
            }}
          />
        )}
        <FilterDropdown
          label="Data Mode"
          value={filters.dataMode}
          options={dataModeOptions}
          onChange={(v) => onFilterChange('dataMode', v)}
        />
        <FilterDropdown
          label="Time Period"
          value={filters.timePeriod}
          options={timePeriodOptions}
          onChange={(v) => onFilterChange('timePeriod', v)}
        />
        <div className="flex-shrink-0">
          <button
            onClick={onApply}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#22C55E] text-white text-sm font-medium hover:bg-[#16A34A] active:bg-[#15803D] transition-colors shadow-sm"
          >
            <Filter size={14} />
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  )
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
  card: (typeof allMetricCards)[number]
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
  const [filters, setFilters] = useState<FilterState>({
    filterType: 'all',
    device: 'all',
    dataMode: 'real-time',
    timePeriod: 'today',
  })

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    filterType: 'all',
    device: 'all',
    dataMode: 'real-time',
    timePeriod: 'today',
  })

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'filterType' && value === 'all') {
        next.device = 'all'
      }
      if (key === 'filterType' && value === 'individual' && next.device === 'all') {
        next.device = devices[0].id
      }
      return next
    })
  }

  const handleApply = () => {
    setAppliedFilters({ ...filters })
  }

  const dashboardData = useMemo(() => {
    if (
      appliedFilters.filterType === 'individual' &&
      appliedFilters.device !== 'all'
    ) {
      const device = devices.find((d) => d.id === appliedFilters.device)
      if (device) {
        return getDeviceMetrics(device)
      }
    }
    return getAllDeviceMetrics()
  }, [appliedFilters])

  const dataModeLabel =
    appliedFilters.dataMode === 'real-time' ? 'real-time' : 'historical'
  const timePeriodLabel =
    timePeriodOptions.find((o) => o.value === appliedFilters.timePeriod)?.label.toLowerCase() ?? 'today'

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
            onFilterChange={handleFilterChange}
            onApply={handleApply}
          />

          <div className="flex gap-4">
            {dashboardData.metricCards.map((card, i) => (
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
                  Distribution of energy consumption across{' '}
                  {appliedFilters.filterType === 'individual' && appliedFilters.device !== 'all'
                    ? 'the selected device'
                    : 'all live devices'}{' '}
                  for {timePeriodLabel} ({dataModeLabel})
                </p>
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.totalConsumption.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total kWh consumption</p>
              </div>

              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={280} height={220}>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {dashboardData.pieData.map((entry, index) => (
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
                {dashboardData.pieData.map((item, i) => (
                  <PieLegendItem key={i} color={item.color} name={item.name} />
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Device Status</h3>
                <div className="space-y-1.5">
                  {dashboardData.deviceStatus.map((d, i) => (
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
                {dashboardData.demandStats.map((stat, i) => (
                  <div key={i} className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={dashboardData.demandData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                  {dashboardData.demandAnalysis.map((d, i) => (
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
