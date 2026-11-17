import {createClient,isSupabaseConfigured} from "./server";
export async function requireAdmin(){
 if(!isSupabaseConfigured())return {error:"Supabase is not configured."} as const;
 const s=await createClient();
 const {data:{user}}=await s.auth.getUser();
 if(!user)return {error:"Sign in required."} as const;
 const {data,error}=await s.rpc("is_terviq_admin");
 if(error||data!==true)return {error:"Administrator access only."} as const;
 return {user} as const;
}
export const strongPassword=(p:string)=>p.length>=8&&/[A-Z]/.test(p)&&/[a-z]/.test(p)&&/[0-9]/.test(p)&&/[^A-Za-z0-9]/.test(p);
