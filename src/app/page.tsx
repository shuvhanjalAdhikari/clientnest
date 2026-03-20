import AppLayout from "@/components/layout/AppLayout"

export default function Home() {
  return (
    <AppLayout title="Dashboard">
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-neutral-900 mb-2">
            Welcome to ClientNest
          </h2>
          <p className="text-neutral-500 text-sm">
            Your workspace is ready.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}