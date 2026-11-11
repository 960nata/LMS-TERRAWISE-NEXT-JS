import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "terrawise.id",
  description: "terrawise.id — Creative Problem Solving",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var badAttrs = ['bis_skin_checked', 'webcrx-bridged', 'webcrx', 'crxlauncher-bridged', 'crxlauncher'];
                function strip(root) {
                  if (!root || !root.querySelectorAll) return;
                  for (var i = 0; i < badAttrs.length; i++) {
                    var attr = badAttrs[i];
                    if (root.hasAttribute && root.hasAttribute(attr)) root.removeAttribute(attr);
                    var els = root.querySelectorAll('[' + attr + ']');
                    for (var j = 0; j < els.length; j++) els[j].removeAttribute(attr);
                  }
                }
                if (typeof MutationObserver !== 'undefined' && document.documentElement) {
                  var obs = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && badAttrs.indexOf(m.attributeName) !== -1) {
                        m.target.removeAttribute(m.attributeName);
                      } else if (m.type === 'childList') {
                        for (var k = 0; k < m.addedNodes.length; k++) strip(m.addedNodes[k]);
                      }
                    }
                  });
                  obs.observe(document.documentElement, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                    attributeFilter: badAttrs,
                  });
                  window.addEventListener('DOMContentLoaded', function() {
                    strip(document.documentElement);
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white text-black antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
