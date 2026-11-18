import {NextResponse} from "next/server";
import {createClient} from "../../dashboard/lib/supabase/server";
export const dynamic="force-dynamic";
export async function GET(){
 const s=await createClient();
 const {data,error}=await s.from("investment_plans").select("id,name,price,duration_days,profit_percent,flex_enabled,flex_profit_percent,profit_interval_value,profit_interval_unit,is_active").eq("is_active",true).order("id");
 if(error)return NextResponse.json({error:"Unable to load investment plans."},{status:500,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json(data||[],{headers:{"Cache-Control":"no-store"}});
}
