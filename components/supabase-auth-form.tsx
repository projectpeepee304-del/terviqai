"use client";
import Link from "next/link";
import {useEffect,useState,useTransition} from "react";
import {ArrowUpRight,Eye,EyeOff,LockKeyhole} from "lucide-react";
import {signIn,signUp} from "@/app/dashboard/actions";
export function SupabaseAuthForm({signup=false}:{signup?:boolean}){
 const [show,setShow]=useState(false);const [message,setMessage]=useState("");const [referralCode,setReferralCode]=useState("");const [busy,startTransition]=useTransition();
 useEffect(()=>{if(signup){const code=new URLSearchParams(window.location.search).get("ref");if(code)setReferralCode(code);}},[signup]);
 function submit(formData:FormData){setMessage("");const password=String(formData.get("password")||"");if(password.length<6||password.length>20||(signup&&(!/[A-Za-z]/.test(password)||!/[0-9]/.test(password)))){setMessage("Password must be 6–20 characters and contain at least one letter and one number.");return;}startTransition(async()=>{const result=signup?await signUp(formData):await signIn(formData);setMessage(("success" in result?result.success:undefined)??("error" in result?result.error:undefined)??"");});}
 return <form className="member-form" action={submit}>
  {signup&&<label>Full name<input name="full_name" required autoComplete="name" placeholder="Enter your full name"/></label>}
  <label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label>
  {signup&&<><label>Phone number<input name="phone" type="tel" autoComplete="tel" placeholder="+234 800 000 0000"/></label><label>Referral code <span className="field-optional">Optional</span><input name="referral_code" placeholder="Enter referral code"/></label></>}
  <label>Password<div className="password-wrap"><input name="password" required type={show?"text":"password"} minLength={6} maxLength={20} pattern={signup?"(?=.*[A-Za-z])(?=.*[0-9]).{6,20}":".{6,20}"} title="Password must be 6–20 characters and contain at least one letter and one number." autoComplete={signup?"new-password":"current-password"} placeholder={signup?"6–20 characters, with a letter and number":"Enter your password"}/><button type="button" aria-label={show?"Hide password":"Show password"} onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
  {signup&&<label className="member-consent"><input type="checkbox" required/> I agree to the <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.</label>}
  {!signup&&<div className="member-form-meta"><label className="member-consent"><input type="checkbox"/> Remember me</label><Link href="/reset-password">Forgot password?</Link></div>}
  <button className="btn btn-green full-btn" type="submit" disabled={busy}>{busy?(signup?"Creating account…":"Signing in…"):(signup?"Create account":"Login")} <ArrowUpRight size={16}/></button>
  {message&&<p className="auth-feedback" role="status">{message}</p>}<p className="auth-security"><LockKeyhole size={14}/> Your account is protected by Supabase authentication.</p>
 </form>;
}
