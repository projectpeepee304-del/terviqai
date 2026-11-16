import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {ReferralsPageV2} from "@/components/finance-pages";
export default function Page(){return <div className="tvq-internal-page"><header className="tvq-internal-head"><Link href="/dashboard" aria-label="Back to dashboard"><ArrowLeft size={19}/></Link><h1>Referral Program</h1><span/></header><div className="tvq-internal-content"><ReferralsPageV2/></div></div>}
