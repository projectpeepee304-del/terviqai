import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {DashboardShell} from "./components/dashboard-shell";
import {createClient,isSupabaseConfigured} from "./lib/supabase/server";
import "./dashboard.css";
export const metadata:Metadata={title:{default:"Member Dashboard",template:"%s | Terviq AI"},robots:{index:false,follow:false}};
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 let userName="John Doe",email="john.doe@terviqai.com",referralCode="TERVIQ-JD50";
 let availableBalance=50,referralBalance=50,totalInvested=50,currentProfit=50,referralEarned=50,friendsReferred=0;
 let transactions:{id:string;type:string;amount:number;status:string;created_at:string}[]=[];
 if(isSupabaseConfigured()){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/dashboard");
  email=user.email||email;userName=String(user.user_metadata?.full_name||user.user_metadata?.name||"John Doe");
  const [profileResult,walletResult,investmentResult,referralResult,transactionResult]=await Promise.all([
   supabase.from("profiles").select("full_name,referral_code").eq("id",user.id).maybeSingle(),
   supabase.from("wallets").select("available_balance,referral_balance").eq("user_id",user.id).maybeSingle(),
   supabase.from("investments").select("principal_amount,profit_amount").eq("user_id",user.id).in("status",["active","matured"]),
   supabase.from("referrals").select("commission_amount,status").eq("referrer_id",user.id),
   supabase.from("transactions").select("id,type,amount,status,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(100)
  ]);
  if(profileResult.data?.full_name)userName=profileResult.data.full_name;if(profileResult.data?.referral_code)referralCode=profileResult.data.referral_code;
  availableBalance=Number(walletResult.data?.available_balance||0);referralBalance=Number(walletResult.data?.referral_balance||0);
  totalInvested=(investmentResult.data||[]).reduce((sum,row)=>sum+Number(row.principal_amount||0),0);
  currentProfit=(investmentResult.data||[]).reduce((sum,row)=>sum+Number(row.profit_amount||0),0);
  friendsReferred=(referralResult.data||[]).length;referralEarned=(referralResult.data||[]).filter(row=>row.status==="credited").reduce((sum,row)=>sum+Number(row.commission_amount||0),0);
  transactions=(transactionResult.data||[]).map(row=>({...row,amount:Number(row.amount||0)}));
 }
 return <DashboardShell userName={userName} email={email} referralCode={referralCode} availableBalance={availableBalance} referralBalance={referralBalance} totalInvested={totalInvested} currentProfit={currentProfit} referralEarned={referralEarned} friendsReferred={friendsReferred} transactions={transactions}>{children}</DashboardShell>;
}
