"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {Bell,Sun,Moon,UserRound,Home,ChartNoAxesCombined,Gift,Sprout,Check,ChevronDown} from "lucide-react";
type Props={children:React.ReactNode;userName:string;email:string;referralCode:string};
const nav=[{label:"Home",href:"/dashboard",Icon:Home},{label:"Invest",href:"/dashboard/invest",Icon:ChartNoAxesCombined},{label:"Referral",href:"/dashboard/referral",Icon:Gift},{label:"Profile",href:"/dashboard/profile",Icon:UserRound}];
export function DashboardShell({children,userName,email,referralCode}:Props){
 const pathname=usePathname();const [theme,setTheme]=useState<"light"|"dark"|"automatic">("light");const [notifications,setNotifications]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem("terviq-dashboard-theme");if(saved==="light"||saved==="dark"||saved==="automatic")setTheme(saved);},[]);
 useEffect(()=>{document.documentElement.dataset.tvqTheme=theme;localStorage.setItem("terviq-dashboard-theme",theme);},[theme]);
 const profilePage=pathname==="/dashboard/profile";
 if(profilePage)return <div className="tvq-dashboard" data-theme={theme}>{children}</div>;
 return <div className="tvq-dashboard" data-theme={theme}>
  <header className="tvq-topbar"><Link href="/dashboard" className="tvq-logo" aria-label="Terviq AI dashboard"><span className="tvq-logo-mark"><Sprout size={19}/></span><span>terviq<span> AI</span></span></Link>
   <div className="tvq-top-actions">
    <div className="tvq-theme-wrap"><button className="tvq-icon-btn" aria-label="Switch theme" title={"Theme: "+theme} onClick={()=>setTheme(theme==="light"?"dark":theme==="dark"?"automatic":"light")}>{theme==="dark"?<Moon size={19}/>:<Sun size={19}/>}</button><span className="tvq-tooltip">{theme==="light"?"Light mode":theme==="dark"?"Dark mode":"Automatic mode"}</span></div>
    <div className="tvq-notice-wrap"><button className={"tvq-icon-btn "+(notifications?"is-active":"")} aria-label="Notifications" aria-expanded={notifications} onClick={()=>setNotifications(!notifications)}><Bell size={19}/><i/></button>{notifications&&<div className="tvq-notice-pop"><div><strong>Notifications</strong><button aria-label="Close notifications" onClick={()=>setNotifications(false)}>×</button></div><section><span className="tvq-empty-bell"><Bell size={22}/></span><b>You’re all caught up</b><p>You don’t have any notifications yet.</p></section></div>}</div>
    <Link href="/dashboard/profile" className="tvq-icon-btn" aria-label="Open profile"><UserRound size={19}/></Link>
   </div>
  </header>
  <main className="tvq-main">{children}</main>
  <nav className="tvq-bottom-nav" aria-label="Dashboard navigation">{nav.map(({label,href,Icon})=><Link key={href} href={href} className={pathname===href?"active":""} aria-current={pathname===href?"page":undefined}><Icon size={19}/><span>{label}</span></Link>)}</nav>
 </div>;
}
