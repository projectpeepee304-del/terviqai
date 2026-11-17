import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {HowItWorksPage} from "@/components/member-pages";
export default function Page(){return <div className="tvq-internal-page"><header className="tvq-internal-head"><Link href="/dashboard" aria-label="Back to dashboard"><ArrowLeft size={19}/></Link><h1>How It Works</h1><span/></header><div className="tvq-internal-content"><HowItWorksPage/></div></div>}
