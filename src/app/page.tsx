"use client";

import { useState } from "react";
import NavBar from "./ui/NavBar";
import { track } from "@/lib/analytics/track";

export default function Home() {
  const [eventType, setEventType] = useState<string>("");
  const [pageName, setPageName] = useState<string>("");

  const sendCustomEvent = (customEventType: string, customPageName: string) => {
    void track("custom_event", { name: customEventType, pageName: customPageName });
  };

  return (
    <>
      <NavBar />
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Home</h1>
        <div className="flex flex-col gap-2 mt-4">
          <button
            className="bg-red-500 text-white p-2 rounded-md"
            onClick={() => sendCustomEvent("test_event", "test_page")}
          >
            SEND CUSTOM EVENT
          </button>
        </div>
        {/* Send an event */}
        <div className="flex flex-col gap-2 mt-4">
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" placeholder="Event Type" value={eventType} onChange={(e) => setEventType(e.target.value)} />
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" placeholder="Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} />
          {eventType && pageName && (
            <button
              className="bg-red-500 text-white p-2 rounded-md"
              onClick={() => sendCustomEvent(eventType, pageName)}
            >
              SEND CUSTOM EVENT
            </button>
          )}
        </div>
      </main>
    </>
  );
}
