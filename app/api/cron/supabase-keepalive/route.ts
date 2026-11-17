import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({ok:false},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({ok:false,error:"Database connection is not configured."},{status:503});
 const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {data,error}=await supabase.rpc("keepalive_ping");
 if(error)return NextResponse.json({ok:false,error:"Database keepalive failed."},{status:503});
 return NextResponse.json({ok:true,checkedAt:data});
}