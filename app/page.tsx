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
import Notifications from "@/components/Notifications";
import PatientsView from "@/components/views/PatientsView";
import EEGReviewView from "@/components/views/EEGReviewView";
import EventsView from "@/components/views/EventsView";
import ReportsView from "@/components/views/ReportsView";
import TrendsView from "@/components/views/TrendsView";
import AlertConfigView from "@/components/views/AlertConfigView";

export type NavId = "dashboard" | "patients" | "eeg" | "events" | "reports" | "trends" | "alerts";

function DashboardView() {
  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      <PatientCard />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-4 space-y-5">
          <IESSSeverity />
          <SpasmBurden />
        </div>
        <div className="col-span-12 xl:col-span-4 space-y-5">
          <SpasmAlert />
          <PhenotypeAnalysis />
        </div>
        <div className="col-span-12 xl:col-span-4 space-y-5">
          <LiveMonitoring />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <EventsList />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Notifications />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState<NavId>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--page-bg)" }}>
      <Sidebar activeView={activeView} onNavChange={setActiveView} />

      <div className="flex-1 flex flex-col ml-56 min-w-0 overflow-hidden">
        <TopBar activeView={activeView} onNavChange={setActiveView} />

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
