import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LoadingScreen from '@/components/LoadingScreen';
import Navbar from '@/components/Navbar';
import HeroBanner from '@/components/HeroBanner';
import MobileSearch from '@/components/MobileSearch';
import HospitalGrid from '@/components/HospitalGrid';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';

const Index = () => {
  const { isLoading } = useApp();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowContent(true);
    }
  }, [isLoading]);

  if (!showContent) {
    return <LoadingScreen onLoadComplete={() => setShowContent(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroBanner />
        <MobileSearch />
        <HospitalGrid />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Index;
