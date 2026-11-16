"use client";
import {useEffect,useState,useTransition} from "react";
import {ArrowUpRight} from "lucide-react";
import {sendPasswordReset} from "@/app/dashboard/actions";
import {createClient} from "@/app/dashboard/lib/supabase/browser";
export function PasswordResetForm(){
 const [message,setMessage]=useState("");const [recovery,setRecovery]=useState(false);const [busy,startTransition]=useTransition();
 useEffect(()=>{if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return;const supabase=createClient();const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==="PASSWORD_RECOVERY")setRecovery(true);});return()=>subscription.unsubscribe();},[]);
 function send(data:FormData){setMessage("");startTransition(async()=>{const result=await sendPasswordReset(data);setMessage("success" in result?result.success:result.error);});}
 async function update(data:FormData){setMessage("");startTransition(async()=>{const password=String(data.get("new_password")||"");if(password.length<8){setMessage("Use at least 8 characters for your new password.");return;}const supabase=createClient();const {error}=await supabase.auth.updateUser({password});setMessage(error?error.message:"Your password has been updated. You can now sign in.");});}
 return recovery?<form className="member-form" action={update}><label>New password<input name="new_password" type="password" required minLength={8} autoComplete="new-password" placeholder="Enter a new password"/></label><button className="btn btn-green full-btn" type="submit" disabled={busy}>{busy?"Updating…":"Update password"} <ArrowUpRight size={16}/></button>{message&&<p className="auth-feedback" role="status">{message}</p>}</form>:<form className="member-form" action={send}><label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label><button className="btn btn-green full-btn" type="submit" disabled={busy}>{busy?"Sending…":"Send reset link"} <ArrowUpRight size={16}/></button>{message&&<p className="auth-feedback" role="status">{message}</p>}</form>;
}
