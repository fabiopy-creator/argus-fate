import { Activity, Lock, ShieldAlert, Users } from 'lucide-react'

function StatusItem({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity
  label: string
  value: string
  accent: 'green' | 'red' | 'cyan'
}) {
  const color =
    accent === 'red'
      ? 'text-alert'
      : accent === 'cyan'
        ? 'text-cyan'
        : 'text-primary'
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`size-3.5 ${color}`} strokeWidth={1.5} />
      <span className="text-muted-foreground">{label}:</span>
      <span className={color}>{value}</span>
    </div>
  )
}

export function StatusBar() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-border bg-muted px-3 py-1.5 text-[10px] sm:text-[11px]">
      <StatusItem icon={Users} label="SESSIONS" value="12" accent="green" />
      <span className="hidden text-border sm:inline">│</span>
      <StatusItem icon={Activity} label="ACTIVE TARGETS" value="07" accent="cyan" />
      <span className="hidden text-border sm:inline">│</span>
      <StatusItem icon={ShieldAlert} label="ALERTS" value="03" accent="red" />
      <span className="hidden text-border sm:inline">│</span>
      <StatusItem icon={Lock} label="SSH" value="SECURED" accent="green" />
      <span className="ml-auto hidden text-muted-foreground md:inline">
        ARGUS DEFENSE OS // ENCRYPTED CHANNEL // {'<'}TLS 1.3{'>'}
      </span>
    </footer>
  )
}
