"use client";
import {usePathname} from "next/navigation";
import {SiteHeader,SiteFooter,BackTop} from "@/components/site";
export function SiteChrome({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const dashboard=pathname.startsWith("/dashboard");
 return <><a className="skip-link" href="#main-content">Skip to content</a>{!dashboard&&<SiteHeader/>}<main id="main-content">{children}</main>{!dashboard&&<SiteFooter/>}{!dashboard&&<BackTop/>}</>;
}
