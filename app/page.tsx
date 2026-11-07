"use client";
import { useCallback, useEffect, useState } from "react";
import IntroLoader from "@/components/IntroLoader";
import Navbar from "@/components/Navbar";
import EnquiryWidget from "@/components/EnquiryWidget";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import CoreDomains from "@/components/sections/CoreDomains";
import PMCDeliveryEngine from "@/components/sections/PMCDeliveryEngine";
import TechSolutions from "@/components/sections/TechSolutions";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const done = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#070b14]" />;
  }

  return (
    <>
      {!loaded && <IntroLoader onDone={done} />}
      {loaded && <Navbar />}
      <main>
        {/* Scroll 1: Hero & Animated Welcoming Guide + 3D Tower */}
        <Hero started={loaded} />

        {/* Scroll 2: Services Hoist Station (Guide pulls cable to lower board) */}
        <Services />

        {/* Scroll 3: The 4 Core Domains (All visible with AI visuals — no hidden tabs) */}
        <CoreDomains />

        {/* Scroll 4: The PMC Delivery Engine (Outsourcing model + 6-step horizontal timeline) */}
        <PMCDeliveryEngine />

        {/* Scroll 5: Architecture & Software Solutions */}
        <TechSolutions />

        {/* Scroll 6: Fast Consultation Form & Direct Contact */}
        <Contact />
      </main>
      <Footer />
      <EnquiryWidget ready={loaded} />
    </>
  );
}
