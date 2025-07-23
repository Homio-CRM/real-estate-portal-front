"use client";
import { useState } from "react";
import Header from "../components/Header";
import HeroImage from "../components/HeroImage";
import PropertyFilters from "../components/PropertyFilters";
import PropertyList from "../components/PropertyList";

export default function Home() {
  const [activeTab, setActiveTab] = useState("comprar");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroImage />
      <div className="max-w-7xl mx-auto">
        <PropertyFilters activeTab={activeTab} onTabChange={setActiveTab} />
        <PropertyList activeTab={activeTab} />
      </div>
    </div>
  );
}
