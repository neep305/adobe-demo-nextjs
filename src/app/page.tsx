'use client';

import { useState, useEffect, useRef } from "react";
import NavBar from "./ui/NavBar";
import { defaultConfig } from "next/dist/server/config-shared";

export default function Home() {
  const [ecid, setECID] = useState<string | null>(null);
  const [core, setCore] = useState<string | null>(null);
  const [eventType, setEventType] = useState<string>("");
  const [pageName, setPageName] = useState<string>("");

  const isConfigured = useRef(false);

  useEffect(() => {
    console.log("useEffect called");
    if (!(window as any).alloy) {
      return;
    }

    // Check if the alloy object is already configured
    if (isConfigured.current) {
      return;
    }

    configureAlloy();
    // handleGetECID();
  }, []);

  const configureAlloy = () => {
    console.log(process.env.NEXT_PUBLIC_DATASTREAM_ID, process.env.NEXT_PUBLIC_IMS_ORG_ID);
    (window as any).alloy("configure", {
      datastreamId: process.env.NEXT_PUBLIC_DATASTREAM_ID,
      orgId: process.env.NEXT_PUBLIC_IMS_ORG_ID,
      context: ["web", "device", "environment", "placeContext"],
      debugEnabled: true,
      defaultConsent: "in",
      targetMigrationEnabled: true
    });
    isConfigured.current = true;
  };

  const handleGetECID = () => {
    (window as any).alloy("getIdentity", {
      "namespaces": ["ECID", "CORE"]
    }).then((result: any) => {
      console.log(`ECID: ${result.identity.ECID}`);
      console.log(`CORE: ${result.identity.CORE}`);
      setECID(result.identity.ECID);
      setCore(result.identity.CORE);
    });
  };

  const sendCustomEvent = (eventType: string, pageName: string) => {
    (window as any).alloy("sendEvent", {
      "xdm": {
        "eventType": eventType,
        "web": {
          "webPageDetails": {
            "name": pageName
          }
        }
      }
    });
  }

  return (
    <>
      <NavBar />
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Home</h1>
        {/* ECID and CORE */}
        <div className="flex flex-col gap-2">
          <span className="text-lg text-bold text-red-300 mb-2">ECID: </span>
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" value={ecid || ""} onChange={(e) => setECID(e.target.value)} disabled={true} />
          <span className="text-lg text-bold text-red-300 mb-2">CORE: </span>
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" value={core || ""} onChange={(e) => setCore(e.target.value)} disabled={true} />
        </div>
        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button className="bg-red-500 text-white p-2 rounded-md" onClick={handleGetECID}>GET ECID</button>
          <button className="bg-red-500 text-white p-2 rounded-md" onClick={() => sendCustomEvent("test_event", "test_page")}>SEND CUSTOM EVENT</button>
        </div>
        {/* Send an event */}
        <div className="flex flex-col gap-2 mt-4">
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" placeholder="Event Type" value={eventType} onChange={(e) => setEventType(e.target.value)} />
          <input type="text" className="border border-red-300 p-2 rounded-md mb-2" placeholder="Page Name" value={pageName} onChange={(e) => setPageName(e.target.value)} />
          {eventType && pageName && <button className="bg-red-500 text-white p-2 rounded-md" onClick={() => sendCustomEvent(eventType, pageName)}>SEND CUSTOM EVENT</button>}
        </div>
      </main>
    </>
  );
}
