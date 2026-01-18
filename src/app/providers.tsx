"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { configureAlloy, setConsentState, type ConsentState } from "@/lib/aep";

const ALLOY_SRC = "https://cdn1.adoberesources.net/alloy/2.27.0/alloy.min.js";
const GTM_ID = "GTM-KHFGSKG6";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("unknown");

  useEffect(() => {
    setConsentState(consent);
  }, [consent]);

  useEffect(() => {
    if (consent !== "granted") {
      return;
    }

    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 20;
    const retryDelayMs = 250;

    const tryConfigure = async () => {
      if (cancelled) {
        return;
      }
      try {
        await configureAlloy();
      } catch {
        if (attempt < maxAttempts) {
          attempt += 1;
          setTimeout(tryConfigure, retryDelayMs);
        }
      }
    };

    void tryConfigure();

    return () => {
      cancelled = true;
    };
  }, [consent]);

  return (
    <>
      {children}
      {consent === "unknown" ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-red-200 bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700">
              We use analytics to improve this demo. Please choose whether to allow
              tracking.
            </div>
            <div className="flex gap-2">
              <button
                className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                onClick={() => setConsent("denied")}
              >
                Decline
              </button>
              <button
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
                onClick={() => setConsent("granted")}
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {consent === "granted" ? (
        <>
          <Script id="alloy-init" strategy="afterInteractive">
            {`
              !function(n,o){
                o.forEach(function(o){
                  n[o]||( (n.__alloyNS=n.__alloyNS||[]).push(o),
                    n[o]=function(){
                      var u=arguments;
                      return new Promise(
                        function(i,l){
                          n.setTimeout(function(){
                            n[o].q.push([i,l,u])
                          })
                        }
                      )
                    },
                    n[o].q=[]
                  )
                })
              }(window,["alloy"]);
            `}
          </Script>
          <Script src={ALLOY_SRC} strategy="afterInteractive" />
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        </>
      ) : null}
    </>
  );
}
