import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {DashboardShell} from "./components/dashboard-shell";
import {createClient,isSupabaseConfigured} from "./lib/supabase/server";
import "./dashboard.css";
export const metadata:Metadata={title:{default:"Member Dashboard",template:"%s | Terviq AI"},robots:{index:false,follow:false}};
export default async function DashboardLayout({children}:{children:React.ReactNode}){
 let userName="John Doe",email="john.doe@terviqai.com",referralCode="TERVIQ-JD50";
 if(isSupabaseConfigured()){
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login?next=/dashboard");
  email=user.email||email;userName=String(user.user_metadata?.full_name||user.user_metadata?.name||"John Doe");
  const {data:profile}=await supabase.from("profiles").select("full_name,referral_code").eq("id",user.id).maybeSingle();
  if(profile?.full_name)userName=profile.full_name;if(profile?.referral_code)referralCode=profile.referral_code;
 }
 return <DashboardShell userName={userName} email={email} referralCode={referralCode}>{children}</DashboardShell>;
}
