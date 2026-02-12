import MobileBlockingOverlay from "@/components/dashboard/MobileBlockingOverlay";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MobileBlockingOverlay />
      {children}
    </div>

  )
}