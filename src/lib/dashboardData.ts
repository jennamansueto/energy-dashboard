export type FilterType = 'all' | 'individual'
export type DataMode = 'realtime' | 'historical'
export type TimePeriod = 'today' | 'week' | 'month'

export interface DashboardFilters {
  filterType: FilterType
  deviceId: string
  dataMode: DataMode
  timePeriod: TimePeriod
}

export const defaultFilters: DashboardFilters = {
  filterType: 'all',
  deviceId: 'device-1',
  dataMode: 'realtime',
  timePeriod: 'today',
}

export const filterTypeOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Devices' },
  { value: 'individual', label: 'Individual Device' },
]

export const dataModeOptions: { value: DataMode; label: string }[] = [
  { value: 'realtime', label: 'Real-Time' },
  { value: 'historical', label: 'Historical' },
]

export const timePeriodOptions: { value: TimePeriod; label: string; days: number }[] = [
  { value: 'today', label: 'Today', days: 1 },
  { value: 'week', label: 'This Week', days: 7 },
  { value: 'month', label: 'This Month', days: 30 },
]

export interface Device {
  id: string
  name: string
  location: string
  status: 'Online' | 'Idle'
  /** Share of total facility consumption (sums to 1). */
  share: number
}

export const devices: Device[] = [
  { id: 'device-1', name: 'Main Building - Floor 1', location: 'Building A', status: 'Online', share: 0.311 },
  { id: 'device-2', name: 'Manufacturing Hall', location: 'Building B', status: 'Online', share: 0.234 },
  { id: 'device-3', name: 'Office Block', location: 'Building C', status: 'Idle', share: 0.182 },
  { id: 'hvac', name: 'HVAC Systems', location: 'Plant Room', status: 'Online', share: 0.143 },
  { id: 'lighting', name: 'Lighting', location: 'All Zones', status: 'Online', share: 0.078 },
  { id: 'equipment', name: 'Equipment', location: 'Workshop', status: 'Idle', share: 0.052 },
]

// IMF-approved palette: bright green, olive green, teal, sky blue, fund blue, dark navy
const pieColors = ['#78BE20', '#658D1B', '#00B0B9', '#009CDE', '#004C97', '#001E60']

export interface MetricCardData {
  label: string
  value: string
  unit: string
  name: string
  change: string
  trend: 'up' | 'down' | 'flat'
  status: string
}

export interface DashboardData {
  metricCards: MetricCardData[]
  totalKwh: string
  pieData: { name: string; value: number; color: string }[]
  deviceStatus: { device: string; status: string; consumption: string }[]
  demandData: { time: string; actual: number; max: number }[]
  demandStats: { value: string; label: string }[]
  demandAnalysis: { label: string; value: string }[]
  scopeDescription: string
  periodDescription: string
}

const BASE_TOTAL_KWH = 15417
const BASE_KVA = 1245.6
const BASE_KVAR = 342.1
const MAX_DEMAND_KW = 1200

const baseActualDemand = [750, 650, 820, 980, 1050, 1100, 1350, 1280, 1300, 1180, 1050]
const hourlyTimes = ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
const weekTimes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthTimes = ['W1', 'W2', 'W3', 'W4']

const fmt = (n: number, digits = 1) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US')

function resample(values: number[], count: number): number[] {
  if (count === values.length) return values
  return Array.from({ length: count }, (_, i) => {
    const pos = (i / (count - 1)) * (values.length - 1)
    const lo = Math.floor(pos)
    const hi = Math.min(values.length - 1, lo + 1)
    return values[lo] + (values[hi] - values[lo]) * (pos - lo)
  })
}

export function getDashboardData(filters: DashboardFilters): DashboardData {
  const period = timePeriodOptions.find((p) => p.value === filters.timePeriod) ?? timePeriodOptions[0]
  const device =
    filters.filterType === 'individual' ? devices.find((d) => d.id === filters.deviceId) : undefined
  const scopeShare = device ? device.share : 1
  const modeFactor = filters.dataMode === 'historical' ? 0.94 : 1
  const kwhTotal = BASE_TOTAL_KWH * scopeShare * period.days * modeFactor
  const kva = BASE_KVA * scopeShare * modeFactor
  const kvar = BASE_KVAR * scopeShare * modeFactor
  const pf = device ? 0.88 + device.share * 0.2 : 0.92
  const kwhConsumed = 8932.4 * scopeShare * period.days * modeFactor

  const scoped = device ? [device] : devices
  const pieData = scoped.map((d, i) => ({
    name: device ? `${d.name} (${d.location})` : d.name,
    value: Math.round(kwhTotal * (device ? 1 : d.share)),
    color: pieColors[devices.indexOf(d) % pieColors.length] ?? pieColors[i],
  }))
  const deviceStatus = scoped.slice(0, device ? 1 : 3).map((d) => ({
    device: device ? `${d.name} - ${d.location}` : d.name,
    status: d.status,
    consumption: `${fmtInt(kwhTotal * (device ? 1 : d.share))} kWh`,
  }))

  const times =
    filters.timePeriod === 'today' ? hourlyTimes : filters.timePeriod === 'week' ? weekTimes : monthTimes
  const actualSeries = resample(baseActualDemand, times.length).map((v) =>
    Math.round(v * scopeShare * modeFactor),
  )
  const maxDemand = Math.round(MAX_DEMAND_KW * scopeShare)
  const demandData = times.map((time, i) => ({ time, actual: actualSeries[i], max: maxDemand }))

  const peak = Math.max(...actualSeries)
  const low = Math.min(...actualSeries)
  const avg = actualSeries.reduce((a, b) => a + b, 0) / actualSeries.length
  const peakIdx = actualSeries.indexOf(peak)
  const lowIdx = actualSeries.indexOf(low)
  const efficiency = Math.min(99, Math.round((avg / peak) * 100 + 10))

  const metricCards: MetricCardData[] = [
    { label: 'KVA', value: fmt(kva), unit: 'kVA', name: 'Apparent Power', change: '+5.2%', trend: 'up', status: 'normal' },
    {
      label: 'KWH',
      value: fmt(kwhConsumed),
      unit: 'kWh',
      name: 'Energy Consumption',
      change: '+12.8%',
      trend: 'up',
      status: scopeShare > 0.25 ? 'high' : 'normal',
    },
    { label: 'KVAR', value: fmt(kvar), unit: 'kVAR', name: 'Reactive Power', change: '-2.1%', trend: 'down', status: 'normal' },
    { label: 'PF', value: fmt(pf, 2), unit: '', name: 'Power Factor', change: '0.0%', trend: 'flat', status: pf >= 0.9 ? 'optimal' : 'normal' },
  ]

  return {
    metricCards,
    totalKwh: fmtInt(kwhTotal),
    pieData,
    deviceStatus,
    demandData,
    demandStats: [
      { value: `${fmtInt(avg)} kW`, label: 'Avg Demand' },
      { value: `${fmtInt(peak)} kW`, label: 'Peak Demand' },
      { value: `${efficiency}%`, label: 'Efficiency' },
    ],
    demandAnalysis: [
      { label: 'Peak Demand Time', value: `${times[peakIdx]} (${fmtInt(peak)} kW)` },
      { label: 'Low Demand Time', value: `${times[lowIdx]} (${fmtInt(low)} kW)` },
      {
        label: 'Demand Variance',
        value: `${fmtInt(peak - low)} kW (${peak ? fmt(((peak - low) / peak) * 100) : '0.0'}%)`,
      },
    ],
    scopeDescription: device ? `${device.name} (${device.location})` : 'all live devices',
    periodDescription: `${period.label.toLowerCase()}${filters.dataMode === 'historical' ? ', historical' : ', real-time'}`,
  }
}
