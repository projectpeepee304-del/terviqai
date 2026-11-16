"use client";
import {useState,useTransition} from "react";
import {ArrowUpRight,Mail} from "lucide-react";
import {sendPasswordReset} from "@/app/dashboard/actions";
export function PasswordResetForm(){const [message,setMessage]=useState("");const [busy,startTransition]=useTransition();function submit(data:FormData){setMessage("");startTransition(async()=>{const result=await sendPasswordReset(data);setMessage(result.success||result.error||"");});}return <form className="member-form" action={submit}><label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label><button className="btn btn-green full-btn" type="submit" disabled={busy}>{busy?"Sending…":"Send reset link"} <ArrowUpRight size={16}/></button>{message&&<p className="auth-feedback" role="status">{message}</p>}</form>}
