"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import PatientCard from "@/components/PatientCard";
import IESSSeverity from "@/components/IESSSeverity";
import SpasmAlert from "@/components/SpasmAlert";
import LiveMonitoring from "@/components/LiveMonitoring";
import PhenotypeAnalysis from "@/components/PhenotypeAnalysis";
import SpasmBurden from "@/components/SpasmBurden";
import EventsList from "@/components/EventsList";
import PatientsView from "@/components/views/PatientsView";
import EEGReviewView from "@/components/views/EEGReviewView";
import EventsView from "@/components/views/EventsView";
import ReportsView from "@/components/views/ReportsView";
import TrendsView from "@/components/views/TrendsView";
import AlertConfigView from "@/components/views/AlertConfigView";

export type NavId = "dashboard" | "patients" | "eeg" | "events" | "reports" | "trends" | "alerts";

function DashboardView() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">
      <PatientCard />

      {/* Main grid: clinical data left, live monitoring right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column: alert + severity + burden */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <SpasmAlert />
          </div>
          <IESSSeverity />
          <SpasmBurden />
        </div>

        {/* Right column: live monitoring (full height) */}
        <div className="lg:col-span-4">
          <LiveMonitoring />
        </div>
      </div>

      {/* Bottom row: events + phenotype */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <EventsList />
        </div>
        <div className="lg:col-span-4">
          <PhenotypeAnalysis />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--page-bg)" }}>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeView={activeView}
        onNavChange={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-56 min-w-0 overflow-hidden">
        <TopBar
          activeView={activeView}
          onNavChange={setActiveView}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "patients"  && <PatientsView />}
          {activeView === "eeg"       && <EEGReviewView />}
          {activeView === "events"    && <EventsView />}
          {activeView === "reports"   && <ReportsView />}
          {activeView === "trends"    && <TrendsView />}
          {activeView === "alerts"    && <AlertConfigView />}
        </div>
      </div>
    </div>
  );
}
