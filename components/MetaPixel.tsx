'use client'

import Script from 'next/script'

export function MetaPixel() {
  return (
    <Script
      id="meta-pixel-global"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          try{
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;t.onerror=function(){};
            b.head.appendChild(t)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1343395010814971');
            fbq('track', 'PageView');
          }catch(e){}
        `,
      }}
    />
  )
}
