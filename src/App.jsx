import { useState, useEffect } from 'react'
import SplashScreen   from './components/SplashScreen.jsx'
import Navbar         from './components/Navbar.jsx'
import HeroBanner     from './components/HeroBanner.jsx'
import ContentSection from './components/ContentSection.jsx'
import ActionGrid     from './components/ActionGrid.jsx'
import Footer         from './components/Footer.jsx'
import ChatModal      from './components/ChatModal.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

export default function App() {
  const [loading,     setLoading]     = useState(true)
  const [chatOpen,    setChatOpen]    = useState(false)
  const [adminOpen,   setAdminOpen]   = useState(false)

  // Simulate Angular bootstrap: dismiss splash after ~950 ms
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 950)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {/* Splashscreen – visible until app hydrates */}
      <SplashScreen visible={loading} />

      {/* Main app – rendered behind splash so transition is instant */}
      <div className="min-h-screen bg-capgemini-pagebg font-sans">
        <Navbar onAdminClick={() => setAdminOpen((open) => !open)} />

        {/* Centred content column matching capgemini.integrityline.com */}
        <main className="max-w-[960px] mx-auto">
          <HeroBanner />
          <ContentSection />
          <ActionGrid onAskQuestion={() => setChatOpen(true)} />
          <Footer />
        </main>
      </div>

      {/* AI Support Chat modal – mounts on top */}
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Admin ticket dashboard overlay */}
      {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}
    </>
  )
}
