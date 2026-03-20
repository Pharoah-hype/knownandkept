import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {children}
      <BottomNav />
    </div>
  )
}
