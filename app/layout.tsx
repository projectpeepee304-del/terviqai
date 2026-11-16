import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import {SiteChrome} from "@/components/site-chrome";
export const metadata: Metadata = { metadataBase:new URL("https://terviqai.com"), title:{default:"Terviq AI | Digital Opportunities & Agricultural Intelligence",template:"%s | Terviq AI"}, description:"Explore Terviq AI's member opportunity platform, referral programme information and agricultural artificial intelligence business.", openGraph:{type:"website",siteName:"Terviq AI",title:"Your Opportunities. Your Earnings. Your Future.",description:"A new generation of digital opportunity, supported by agricultural AI.",url:"https://terviqai.com"}, alternates:{canonical:"https://terviqai.com"}, icons:{icon:"/favicon.svg"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body><SiteChrome>{children}</SiteChrome><Script src="/livechat.js" strategy="afterInteractive"/></body></html>}
