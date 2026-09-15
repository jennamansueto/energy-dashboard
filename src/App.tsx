import './App.css'
import { useId, useState, useEffect, useRef, type FormEvent } from 'react'
import {
  Zap,
  Filter,
  Loader2,
  LayoutGrid,
  BarChart3,
  Settings,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  LogOut,
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

import {
  type DashboardFilters,
  type MetricCardData,
  defaultFilters,
  devices,
  filterTypeOptions,
  dataModeOptions,
  timePeriodOptions,
  getDashboardData,
} from './lib/dashboardData'

const FUND_BLUE = '#004C97'
const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004C97]'

// Sidebar

const navItems = [
  { icon: Zap, label: 'Energy', active: true },
  { icon: LayoutGrid, label: 'Overview', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
  { icon: FileText, label: 'Reports', active: false },
  { icon: User, label: 'Profile', active: false },
]

function Sidebar() {
  return (
    <aside className="flex flex-col items-center justify-between py-5 w-[70px] min-h-screen bg-[#F1F5F4]">
      <nav aria-label="Main navigation" className="flex flex-col items-center gap-2">
        {navItems.map((item, i) => {
          const Icon = item.icon
          return (
            <button
              key={i}
              type="button"
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
              className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${FOCUS_RING} ${
                item.active
                  ? 'bg-[#7BDC93] text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Icon size={18} strokeWidth={2} aria-hidden="true" />
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
        <button
          type="button"
          aria-label="Log out"
          className={`text-gray-500 hover:text-gray-700 rounded ${FOCUS_RING}`}
        >
          <LogOut size={20} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

// Filter Bar

function FilterField({
  id,
  label,
  children,
  className = '',
}: {
  id: string
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-[#707372]">
        {label}
      </label>
      {children}
    </div>
  )
}

const selectClass = `w-full h-[31px] appearance-none rounded-md border border-[#707372] bg-white pl-3 pr-8 text-xs text-black ${FOCUS_RING} disabled:bg-[#F1F5F4] disabled:text-[#707372] disabled:cursor-not-allowed`

function SelectChevron() {
  return (
    <ChevronDown
      size={14}
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707372]"
    />
  )
}

function FilterBar({
  onApply,
  loading,
}: {
  onApply: (filters: DashboardFilters) => void
  loading: boolean
}) {
  const [draft, setDraft] = useState<DashboardFilters>(defaultFilters)
  const uid = useId()
  const ids = {
    type: `${uid}-type`,
    device: `${uid}-device`,
    mode: `${uid}-mode`,
    period: `${uid}-period`,
  }
  const deviceDisabled = draft.filterType !== 'individual'
  const selectedDevice = devices.find((d) => d.id === draft.deviceId)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onApply(draft)
  }

  return (
    <section aria-labelledby={`${uid}-heading`}>
      <h2 id={`${uid}-heading`} className="sr-only">
        Dashboard filters
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-[#B1B3B3]/60 bg-white p-4 shadow-sm"
      >
        <FilterField id={ids.type} label="Filter Type" className="w-[146px]">
          <div className="relative">
            <select
              id={ids.type}
              className={selectClass}
              value={draft.filterType}
              onChange={(e) =>
                setDraft({ ...draft, filterType: e.target.value as DashboardFilters['filterType'] })
              }
            >
              {filterTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </FilterField>

        <FilterField id={ids.device} label="Select Device" className="w-[244px]">
          <div className="relative">
            {!deviceDisabled && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full"
                style={{ backgroundColor: selectedDevice?.status === 'Online' ? '#78BE20' : '#B1B3B3' }}
              />
            )}
            <select
              id={ids.device}
              className={`${selectClass} ${deviceDisabled ? '' : 'pl-6'}`}
              value={draft.deviceId}
              disabled={deviceDisabled}
              aria-describedby={deviceDisabled ? `${ids.device}-hint` : undefined}
              onChange={(e) => setDraft({ ...draft, deviceId: e.target.value })}
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.location}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          {deviceDisabled && (
            <span id={`${ids.device}-hint`} className="sr-only">
              Choose Individual Device as the filter type to select a device
            </span>
          )}
        </FilterField>

        <FilterField id={ids.mode} label="Data Mode" className="w-[146px]">
          <div className="relative">
            <select
              id={ids.mode}
              className={selectClass}
              value={draft.dataMode}
              onChange={(e) =>
                setDraft({ ...draft, dataMode: e.target.value as DashboardFilters['dataMode'] })
              }
            >
              {dataModeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </FilterField>

        <FilterField id={ids.period} label="Time Period" className="w-[146px]">
          <div className="relative">
            <select
              id={ids.period}
              className={selectClass}
              value={draft.timePeriod}
              onChange={(e) =>
                setDraft({ ...draft, timePeriod: e.target.value as DashboardFilters['timePeriod'] })
              }
            >
              {timePeriodOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </FilterField>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className={`ml-auto flex h-[38px] items-center gap-2 rounded-md bg-[#78BE20] px-4 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-[#658D1B] disabled:cursor-wait disabled:opacity-80 ${FOCUS_RING}`}
        >
          {loading ? (
            <Loader2 size={14} aria-hidden="true" className="motion-safe:animate-spin" />
          ) : (
            <Filter size={14} aria-hidden="true" />
          )}
          {loading ? 'Applying…' : 'Apply Filter'}
        </button>
      </form>
    </section>
  )
}

// Metric Card

function MetricCard({ card }: { card: MetricCardData }) {
  const TrendIcon =
    card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus

  const changeColor =
    card.trend === 'up'
      ? 'text-[#7BDC93]'
      : card.trend === 'down'
        ? 'text-[#FF6467]'
        : 'text-white'

  return (
    <article className="flex-1 rounded-xl bg-gradient-to-br from-[#2C5F4E] to-[#1A3A2E] p-4 min-w-0">
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
          <TrendIcon size={12} aria-hidden="true" />
          <span className="text-[10px]">
            <span className="sr-only">
              {card.trend === 'up' ? 'Up ' : card.trend === 'down' ? 'Down ' : 'Unchanged '}
            </span>
            {card.change}
          </span>
        </div>
      </div>
    </article>
  )
}

// Pie Chart Legend Item

function PieLegendItem({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
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

const APPLY_DELAY_MS = 400

function App() {
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(defaultFilters)
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleApply = (filters: DashboardFilters) => {
    clearTimeout(timerRef.current)
    setLoading(true)
    setStatusMessage('')
    timerRef.current = setTimeout(() => {
      setAppliedFilters(filters)
      setLoading(false)
      const { scopeDescription, periodDescription } = getDashboardData(filters)
      setStatusMessage(`Dashboard updated: showing ${scopeDescription}, ${periodDescription}.`)
    }, APPLY_DELAY_MS)
  }

  const data = getDashboardData(appliedFilters)
  const isRealtime = appliedFilters.dataMode === 'realtime'

  return (
    <div className="flex min-h-screen bg-[#F8FAF9] font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-5 space-y-5">
          <header className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Hello, Liam Gallagher! &#x1F44B;
              </h1>
              <p className="text-sm text-[#707372] mt-0.5">What are you looking for today?</p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                isRealtime ? 'border-[#78BE20] bg-[#78BE20]/15' : 'border-[#B1B3B3] bg-[#F1F5F4]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${isRealtime ? 'bg-[#78BE20]' : 'bg-[#707372]'}`}
              />
              <span className={`text-[10px] font-medium ${isRealtime ? 'text-[#658D1B]' : 'text-[#707372]'}`}>
                {isRealtime ? 'Real-time monitoring active' : 'Historical data view'}
              </span>
            </div>
          </header>

          <FilterBar onApply={handleApply} loading={loading} />

          <p role="status" aria-live="polite" className="sr-only">
            {loading ? 'Applying filters, updating dashboard…' : statusMessage}
          </p>

          <div
            aria-busy={loading}
            className={`space-y-5 transition-opacity motion-reduce:transition-none ${loading ? 'opacity-60' : ''}`}
          >
          <section aria-label="Key metrics" className="flex gap-4">
            {data.metricCards.map((card) => (
              <MetricCard key={card.label} card={card} />
            ))}
          </section>

          <div className="flex gap-5">
            <section aria-labelledby="consumption-heading" className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 id="consumption-heading" className="text-base font-semibold text-gray-900">
                  Energy Consumption Overview
                </h2>
                <p className="text-xs text-[#707372] mt-0.5">
                  Distribution of energy consumption across {data.scopeDescription} for {data.periodDescription}
                </p>
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-900">{data.totalKwh}</p>
                <p className="text-xs text-[#707372]">Total kWh consumption</p>
              </div>

              <div className="flex justify-center mb-3">
                <ResponsiveContainer width={280} height={220}>
                  <PieChart>
                    <Pie
                      data={data.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {data.pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
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
                {data.pieData.map((item) => (
                  <PieLegendItem key={item.name} color={item.color} name={item.name} />
                ))}
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Device Status</h3>
                <div className="space-y-1.5">
                  {data.deviceStatus.map((d) => (
                    <DeviceStatusRow key={d.device} {...d} />
                  ))}
                </div>
              </div>
            </section>

            <section aria-labelledby="demand-heading" className="flex-1 bg-white/80 border border-gray-200/30 rounded-xl shadow-sm p-5">
              <div className="mb-4">
                <h2 id="demand-heading" className="text-base font-semibold text-gray-900">Max vs Actual Demand</h2>
                <p className="text-xs text-[#707372] mt-0.5">
                  Comparison of peak demand against actual usage over time ({data.periodDescription})
                </p>
              </div>

              <div className="flex gap-4 mb-4">
                {data.demandStats.map((stat) => (
                  <div key={stat.label} className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-[#707372]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.demandData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 10, fill: '#707372' }}
                      axisLine={{ stroke: '#1A1A1A' }}
                      tickLine={{ stroke: '#1A1A1A' }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#707372' }}
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
                      stroke="#DA291C"
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#DA291C' }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke={FUND_BLUE}
                      dot={{ r: 4, fill: FUND_BLUE }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-xs font-medium text-gray-900 mb-2">Demand Analysis</h3>
                <div className="space-y-1.5">
                  {data.demandAnalysis.map((d) => (
                    <DemandAnalysisRow key={d.label} {...d} />
                  ))}
                </div>
              </div>
            </section>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
