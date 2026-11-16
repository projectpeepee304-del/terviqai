"use client";
import {usePathname} from "next/navigation";
import {SiteHeader,SiteFooter,BackTop} from "@/components/site";
export function SiteChrome({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const dashboard=pathname.startsWith("/dashboard"); const auth=pathname==="/login"||pathname==="/signup"||pathname==="/reset-password";
 return <><a className="skip-link" href="#main-content">Skip to content</a>{!dashboard&&<div className={auth?"site-chrome-auth":""}><SiteHeader/></div>}{dashboard?<div id="main-content">{children}</div>:<main id="main-content">{children}</main>}{!dashboard&&<div className={auth?"site-chrome-auth":""}><SiteFooter/></div>}{!dashboard&&<BackTop/>}</>;
}
