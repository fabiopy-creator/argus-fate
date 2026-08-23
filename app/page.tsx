import { TopBar } from '@/components/top-bar'
import { LogoPanel } from '@/components/logo-panel'
import { SystemMetrics } from '@/components/system-metrics'
import { ModulesPanel } from '@/components/modules-panel'
import { ActivityFeed } from '@/components/activity-feed'
import { AttackMap } from '@/components/attack-map'
import { CliConsole } from '@/components/cli-console'
import { StatusBar } from '@/components/status-bar'
import { ModuleModal } from '@/components/module-modals'


export default function Page() {
  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-2 p-2 sm:p-3">
        <TopBar />

        {/* Top row: identity + metrics */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <LogoPanel />
          <SystemMetrics />
        </div>

        {/* Middle row: modules + activity feed */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <ModulesPanel className="max-h-[420px]" />
          <ActivityFeed className="max-h-[420px]" />
        </div>

        {/* Attack map */}
        <AttackMap />

        {/* CLI console */}
        <CliConsole />

        <StatusBar />
      </main>

      {/* Global Module Overlay Modals */}
      <ModuleModal />
    </>
  )
}

