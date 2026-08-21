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
import DocsView from "@/components/views/DocsView";

export type NavId = "dashboard" | "patients" | "eeg" | "events" | "reports" | "trends" | "alerts" | "docs";

function DashboardView({ onSeekEeg }: { onSeekEeg: (sec: number) => void }) {
  return (
    <div className="px-4 pt-6 pb-4 md:px-10 md:pt-8 md:pb-6 space-y-4 max-w-[1400px]">
      <PatientCard />

      {/* Two independent stacks, each sized by its own content: left carries
          the alert banner, IESS/burden row, and events list; right carries
          live monitoring and the phenotype card. */}
      <div className="dashboard-bento">
        <div className="area-left">
          <SpasmAlert onReview={onSeekEeg} />
          <div className="area-split">
            <IESSSeverity />
            <SpasmBurden />
          </div>
          <EventsList onSelectEvent={onSeekEeg} />
        </div>
        <div className="area-right">
          <LiveMonitoring />
          <PhenotypeAnalysis />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Set when an event row (dashboard, event log, or the alert banner) is
  // clicked — jumps to EEG Review and seeks the waveform to that event's
  // real time window, so "view this spasm's EEG" is an actual working action.
  const [eegSeekSec, setEegSeekSec] = useState<number | null>(null);

  function goToEegAt(sec: number) {
    setEegSeekSec(sec);
    setActiveView("eeg");
  }

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

      <div className="flex-1 flex flex-col md:ml-60 min-w-0 overflow-hidden">
        <TopBar
          activeView={activeView}
          onNavChange={setActiveView}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          {activeView === "dashboard" && <DashboardView onSeekEeg={goToEegAt} />}
          {activeView === "patients"  && <PatientsView />}
          {activeView === "eeg"       && <EEGReviewView initialSeekSec={eegSeekSec} />}
          {activeView === "events"    && <EventsView onSelectEvent={goToEegAt} />}
          {activeView === "reports"   && <ReportsView />}
          {activeView === "trends"    && <TrendsView />}
          {activeView === "alerts"    && <AlertConfigView />}
          {activeView === "docs"      && <DocsView />}
        </div>
      </div>
    </div>
  );
}
