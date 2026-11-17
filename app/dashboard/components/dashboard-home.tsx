"use client";
import Link from "next/link";
import {useContext,useEffect,useState} from "react";
import {Eye,EyeOff,ArrowUpRight,Wallet,Gift,ChartNoAxesCombined,Clock3} from "lucide-react";
import {DashboardUserContext} from "./dashboard-shell";
const naira=(n:number)=>"₦"+n.toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
export function DashboardHome(){
 const {userName,availableBalance,referralBalance}=useContext(DashboardUserContext);const [visible,setVisible]=useState(true);const [greeting,setGreeting]=useState("Good morning");const [today,setToday]=useState("");
 useEffect(()=>{const hour=new Date().getHours();setGreeting(hour<12?"Good morning":hour<17?"Good afternoon":"Good evening");setToday(new Intl.DateTimeFormat("en-NG",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date()));},[]);
 return <><section className="tvq-greeting"><div><p>{greeting},</p><h1>{userName}</h1></div><span className="tvq-greeting-note">Welcome to your Terviq AI account</span></section>
  <section className="tvq-balance-card"><div className="tvq-balance-head"><span>PORTFOLIO BALANCE</span><time>{today}</time></div><div className="tvq-balance-grid"><div className="tvq-balance-cell"><span>Available Balance <button className="tvq-eye" aria-label={visible?"Hide balances":"Show balances"} onClick={()=>setVisible(!visible)}>{visible?<Eye size={17}/>:<EyeOff size={17}/>}</button></span><strong>{visible?naira(availableBalance):"₦••••••"}</strong><small>Ready for your next move</small></div><div className="tvq-balance-cell"><span>Referral Balance</span><strong>{visible?naira(referralBalance):"₦••••••"}</strong><small>Your referral rewards</small></div></div></section>
  <section className="tvq-section"><div className="tvq-section-head"><h2>Quick actions</h2></div><div className="tvq-quick-grid">
   <Link className="tvq-quick-card" href="/dashboard/invest"><span className="tvq-quick-icon"><ChartNoAxesCombined size={20}/></span><span><b>Explore investments</b><small>Compare available plans</small></span><ArrowUpRight size={16}/></Link>
   <Link className="tvq-quick-card" href="/dashboard/referral"><span className="tvq-quick-icon"><Gift size={20}/></span><span><b>Invite friends</b><small>Earn referral commission</small></span><ArrowUpRight size={16}/></Link>
   <Link className="tvq-quick-card" href="/dashboard/profile"><span className="tvq-quick-icon"><Wallet size={20}/></span><span><b>Account profile</b><small>Manage your details</small></span><ArrowUpRight size={16}/></Link>
  </div></section>
  <section className="tvq-section"><div className="tvq-section-head"><h2>Account overview</h2><Link href="/dashboard/profile">View profile <ArrowUpRight size={13}/></Link></div><div className="tvq-overview-grid"><article className="tvq-panel"><h3>Recent activity</h3><div className="tvq-empty-activity"><span><Clock3 size={19}/></span><div><b style={{fontSize:12}}>Your activity will appear here</b><p>Deposits, investments, profits and withdrawals will be listed in this space.</p></div></div></article><article className="tvq-panel tvq-ref-mini"><h3>Grow with referrals</h3><p>Invite friends to Terviq AI and earn a 10% commission on each eligible referee’s first investment.</p><Link href="/dashboard/referral">View referral details <ArrowUpRight size={13}/></Link></article></div></section>
  <section className="tvq-section"><div className="tvq-section-head"><h2>Your next step</h2></div><article className="tvq-panel" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:20}}><div><h3>Explore the Terviq AI opportunity</h3><p>Review the available investment structures and choose the plan that aligns with your goals.</p></div><Link href="/dashboard/invest" className="tvq-buy" style={{whiteSpace:"nowrap"}}>View plans <ArrowUpRight size={15}/></Link></article></section>
 </>;
}
