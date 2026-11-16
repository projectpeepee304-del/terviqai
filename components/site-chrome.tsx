"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {SiteHeader,SiteFooter,BackTop} from "@/components/site";

declare global {
 interface Window {
  Tawk_API?: {
   customStyle?: { visibility: { desktop: { position: string; xOffset: string; yOffset: string }; mobile: { position: string; xOffset: string; yOffset: string } } };
   hideWidget?: () => void;
   showWidget?: () => void;
  };
  Tawk_LoadStart?: Date;
 }
}

export function SiteChrome({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const dashboard=pathname.startsWith("/dashboard");
 const auth=pathname==="/login"||pathname==="/signup"||pathname==="/reset-password";
 useEffect(()=>{
  if(auth){
   window.Tawk_API?.hideWidget?.();
   return;
  }
  const offset=dashboard?"50px":"100px";
  window.Tawk_API=window.Tawk_API||{};
  window.Tawk_API.customStyle={visibility:{
   desktop:{position:"br",xOffset:"0px",yOffset:offset},
   mobile:{position:"br",xOffset:"0px",yOffset:offset}
  }};
  window.Tawk_API.showWidget?.();
  if(!document.querySelector('script[data-terviq-tawk="true"]')){
   window.Tawk_LoadStart=new Date();
   const script=document.createElement("script");
   script.async=true;
   script.src="https://embed.tawk.to/6afb030a66b4883c8464d179/1k7i87p63";
   script.charset="UTF-8";
   script.setAttribute("crossorigin","*");
   script.dataset.terviqTawk="true";
   document.head.appendChild(script);
  }
 },[auth,dashboard]);
 return <><a className="skip-link" href="#main-content">Skip to content</a>{!dashboard&&<div className={auth?"site-chrome-auth":""}><SiteHeader/></div>}{dashboard?<div id="main-content">{children}</div>:<main id="main-content" className={auth?"auth-route-main":""}>{children}</main>}{!dashboard&&<div className={auth?"site-chrome-auth":""}><SiteFooter/></div>}{!dashboard&&<BackTop/>}</>;
}
