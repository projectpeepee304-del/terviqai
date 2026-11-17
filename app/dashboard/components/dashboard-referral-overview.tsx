"use client";
import Link from "next/link";
import {useContext} from "react";
import {ArrowUpRight,Gift,Users,Wallet,CheckCircle2} from "lucide-react";
import {DashboardUserContext} from "./dashboard-shell";
const money=(n:number)=>"₦"+Number(n||0).toLocaleString("en-NG",{minimumFractionDigits:2,maximumFractionDigits:2});
export function DashboardReferralOverview(){
 const {referralCode,friendsReferred,qualifiedReferrals,referralEarned,referralBalance}=useContext(DashboardUserContext);
 const referralLink="https://terviqai.com/signup?ref="+encodeURIComponent(referralCode);
 return <section className="tvq-referral-overview"><div className="tvq-referral-overview-hero"><span className="tvq-referral-overview-kicker">MEMBER REFERRAL CENTRE</span><h2>Invite. Earn. Grow Together.</h2><p>Track your referrals, commission earned and available referral balance in one place.</p><div className="tvq-referral-overview-rate"><b>10%</b><span>commission on each eligible referee’s first investment</span></div></div><div className="tvq-referral-overview-card"><div className="tvq-referral-overview-heading"><Gift size={18}/><b>Referral overview</b></div><div className="tvq-referral-overview-grid"><article><Users size={17}/><small>Total referrals</small><b>{friendsReferred.toLocaleString("en-NG")}</b></article><article><CheckCircle2 size={17}/><small>Qualified referrals</small><b>{qualifiedReferrals.toLocaleString("en-NG")}</b></article><article><Gift size={17}/><small>Commission earned</small><b>{money(referralEarned)}</b></article><article><Wallet size={17}/><small>Available referral balance</small><b>{money(referralBalance)}</b></article></div><div className="tvq-referral-overview-link"><div><small>YOUR PERSONAL REFERRAL CODE</small><b>{referralCode||"—"}</b><span>{referralLink}</span></div><Link href="/dashboard/referral" className="tvq-referral-overview-button">Access your referral link <ArrowUpRight size={15}/></Link></div></div></section>;
}