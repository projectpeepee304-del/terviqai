import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter, BackTop } from "@/components/site";
export const metadata: Metadata = { metadataBase:new URL("https://terviqai.com"), title:{default:"Terviq AI | Intelligence That Grows",template:"%s | Terviq AI"}, description:"Terviq AI is a Norwegian agricultural technology company established in 2019, advancing intelligent agriculture through AI, automation and data intelligence.", openGraph:{type:"website",siteName:"Terviq AI",title:"Intelligence That Grows",description:"AI-powered intelligence for the future of agriculture.",url:"https://terviqai.com"}, alternates:{canonical:"https://terviqai.com"}, icons:{icon:"/favicon.svg"} };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader/><main id="main-content">{children}</main><SiteFooter/><BackTop/></body></html>}
