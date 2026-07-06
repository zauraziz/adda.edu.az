import { TopBar } from '@/components/layout/TopBar/TopBar';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { HeroSlider } from '@/components/sections/HeroSlider/HeroSlider';
import { GlassDock } from '@/components/sections/GlassDock/GlassDock';
import { StatsCounter } from '@/components/sections/StatsCounter/StatsCounter';
import { NewsGrid } from '@/components/sections/NewsGrid/NewsGrid';
import { Academy40 } from '@/components/sections/Academy40/Academy40';
import { PartnershipCards } from '@/components/sections/PartnershipCards/PartnershipCards';
import { PartnerLogos } from '@/components/sections/PartnerLogos/PartnerLogos';
import { CareerCenter } from '@/components/sections/CareerCenter/CareerCenter';
import { FaqAccordion } from '@/components/sections/FaqAccordion/FaqAccordion';
import { Footer } from '@/components/layout/Footer/Footer';

export default function HomePage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        <HeroSlider />
        <GlassDock />
        <StatsCounter />
        <NewsGrid />
        <Academy40 />
        <PartnershipCards />
        <PartnerLogos />
        <CareerCenter />
        <FaqAccordion />
      </main>
      <Footer />
    </>
  );
}
