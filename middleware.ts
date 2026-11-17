import {NextRequest,NextResponse} from "next/server";
import {createServerClient} from "@supabase/ssr";
export async function middleware(req:NextRequest){
 const headers=new Headers(req.headers);headers.set("x-terviq-pathname",req.nextUrl.pathname);
 let response=NextResponse.next({request:{headers}});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{getAll(){return req.cookies.getAll();},setAll(cookiesToSet){cookiesToSet.forEach(({name,value})=>req.cookies.set(name,value));response=NextResponse.next({request:{headers}});cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const {data:{user}}=await supabase.auth.getUser();
 if(user){
  const {data:profile}=await supabase.from("profiles").select("account_status").eq("id",user.id).maybeSingle();
  if(profile?.account_status!=="active"){
   await supabase.auth.signOut();
   const destination=new URL("/login?reason=suspended",req.url);
   const redirect=NextResponse.redirect(destination);
   response.cookies.getAll().forEach(cookie=>redirect.cookies.set(cookie.name,"",{...cookie, maxAge:0}));
   return redirect;
  }
 }
 return response;
}
export const config={matcher:["/dashboard/:path*"]};
