import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adobe Demo App",
  description: "Adobe Demo App for the Adobe client to test the Adobe API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* Alloy init script */}
        <Script id="alloy-init" strategy="beforeInteractive">
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
        {/* Alloy SDK 로드 */}
        <Script
          src="https://cdn1.adoberesources.net/alloy/2.27.0/alloy.min.js"
          strategy="beforeInteractive"
        />
        {/* Google Tag Manager */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KHFGSKG6');
            `,
          }}
         />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KHFGSKG6"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  );
}
