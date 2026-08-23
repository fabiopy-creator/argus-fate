import { Panel } from '@/components/panel'

const ASCII = String.raw`
  █████╗ ██████╗  ██████╗ ██╗   ██╗███████╗
 ██╔══██╗██╔══██╗██╔════╝ ██║   ██║██╔════╝
 ███████║██████╔╝██║  ███╗██║   ██║███████╗
 ██╔══██║██╔══██╗██║   ██║██║   ██║╚════██║
 ██║  ██║██║  ██║╚██████╔╝╚██████╔╝███████║
 ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
 ███████╗ █████╗ ████████╗███████╗
 ██╔════╝██╔══██╗╚══██╔══╝██╔════╝
 █████╗  ███████║   ██║   █████╗
 ██╔══╝  ██╔══██║   ██║   ██╔══╝
 ██║     ██║  ██║   ██║   ███████╗
 ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚══════╝
`

function MetaRow({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-dim py-1 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={alert ? 'text-alert' : 'text-primary'}>{value}</span>
    </div>
  )
}

export function LogoPanel() {
  return (
    <Panel title="C2 IDENTITY" accent="red" className="min-h-0">
      <div className="flex h-full flex-col">
        <div className="overflow-x-auto">
          <pre className="w-max text-[6px] font-bold leading-none text-alert sm:text-[8px] md:text-[9px]">
            {ASCII}
          </pre>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground text-pretty">
          {'>'} TACTICAL OFFENSIVE & DEFENSIVE C2 FRAMEWORK. AUTHORIZED
          PERSONNEL ONLY. ALL SESSIONS ARE LOGGED AND MONITORED.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <MetaRow label="CODED BY" value="MrSanZz" />
          <MetaRow label="VERSION" value="v4.2.1-STABLE" />
          <MetaRow label="BUILD" value="0xFA7E-2277" />
          <MetaRow label="LICENSE" value="CLASSIFIED" alert />
          <MetaRow label="STATUS" value="OPERATIONAL" />
          <MetaRow label="CLEARANCE" value="LEVEL-5 // OMEGA" alert />
        </div>
        <div className="mt-3 border border-alert/40 bg-alert/5 px-2 py-1 text-[10px] text-alert">
          {'!! '} WARNING: UNAUTHORIZED ACCESS WILL TRIGGER COUNTERMEASURES
        </div>
      </div>
    </Panel>
  )
}
