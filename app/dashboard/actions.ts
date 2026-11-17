"use server";
import {redirect} from "next/navigation";
import {createClient,isSupabaseConfigured} from "./lib/supabase/server";


export async function signIn(formData:FormData){
 const password=String(formData.get("password")||"");if(password.length<6||password.length>20||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return {error:"Password must be 6–20 characters and contain at least one letter and one number."};
 if(!isSupabaseConfigured()) return {error:"Account access is being configured. Please try again shortly."};
 const supabase=await createClient();
 const {error}=await supabase.auth.signInWithPassword({email:String(formData.get("email")||"").trim(),password:String(formData.get("password")||"")});
 if(error) return {error:error.message};
 const {data:{user}}=await supabase.auth.getUser();
 if(user){const {data:profile}=await supabase.from("profiles").select("account_status").eq("id",user.id).maybeSingle();if(profile?.account_status==="suspended"){await supabase.auth.signOut();return {error:"This account has been suspended. Please contact Terviq AI support."};}const {data:isAdmin}=await supabase.rpc("is_terviq_admin");redirect(isAdmin===true?"/dashboard/admin":"/dashboard");}
 redirect("/dashboard");
}
export async function signUp(formData:FormData){
 const password=String(formData.get("password")||"");if(password.length<6||password.length>20||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return {error:"Password must be 6–20 characters and contain at least one letter and one number."};
 if(!isSupabaseConfigured()) return {error:"Account registration is being configured. Please try again shortly."};
 const supabase=await createClient();
 const {error}=await supabase.auth.signUp({email:String(formData.get("email")||"").trim(),password:String(formData.get("password")||""),options:{emailRedirectTo:(process.env.NEXT_PUBLIC_SITE_URL||"https://terviqai.com")+"/auth/callback?next=%2Fdashboard",data:{full_name:String(formData.get("full_name")||"").trim(),phone:String(formData.get("phone")||"").trim(),referral_code:String(formData.get("referral_code")||"").trim()}}});
 if(error)return {error:error.message};return {success:"Check your email to confirm your Terviq AI account, then sign in."};
}
export async function signOut(){if(isSupabaseConfigured()){const supabase=await createClient();await supabase.auth.signOut();}redirect("/login");}
export async function saveProfile(formData:FormData){
 if(!isSupabaseConfigured())return {error:"Connect your Supabase project to save profile changes."};
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:"Please sign in again."};
 const full_name=String(formData.get("full_name")||"").trim(),phone=String(formData.get("phone")||"").trim(),date_of_birth=String(formData.get("date_of_birth")||"")||null,email=String(formData.get("email")||"").trim();
 const {error}=await supabase.from("profiles").update({full_name,phone,date_of_birth,email,updated_at:new Date().toISOString()}).eq("id",user.id);
 if(error)return {error:error.message};
 if(email&&email!==user.email){const {error:emailError}=await supabase.auth.updateUser({email});if(emailError)return {error:emailError.message};return {success:"Profile saved. Confirm your new email address using the message we sent you."};}
 return {success:"Your profile has been saved."};
}
export async function changePassword(formData:FormData){
 if(!isSupabaseConfigured())return {error:"Connect your Supabase project to change your password."};
 const current=String(formData.get("current_password")||""),next=String(formData.get("new_password")||"");if(next.length<8)return {error:"Your new password must contain at least 8 characters."};
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user?.email)return {error:"Please sign in again."};
 const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:current});if(verifyError)return {error:"Your current password is incorrect."};
 const {error}=await supabase.auth.updateUser({password:next});return error?{error:error.message}:{success:"Your password has been updated."};
}
export async function sendPasswordReset(formData:FormData){
 if(!isSupabaseConfigured())return {error:"Connect your Supabase project to reset your password."};
 const email=String(formData.get("email")||"").trim(),supabase=await createClient();const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:(process.env.NEXT_PUBLIC_SITE_URL||"https://terviqai.com")+"/auth/callback?next=%2Freset-password%3Frecovery%3D1"});
 return error?{error:error.message}:{success:"If an account exists for this email, a password reset link has been sent."};
}

export async function markNotificationRead(id:string){
 if(!isSupabaseConfigured())return {error:"Notifications are unavailable."};
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return {error:"Please sign in again."};
 const {error}=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("id",id).eq("user_id",user.id).eq("requires_action",false);
 return error?{error:error.message}:{success:true};
}
