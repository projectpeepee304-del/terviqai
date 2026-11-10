"use client";
import Link from "next/link";
import {useMemo,useState,type FormEvent} from "react";
import {ArrowDownLeft,ArrowUpRight,Wallet,Gift,Users,Clock3,ShieldCheck,Search,ChevronDown,Eye,EyeOff,LockKeyhole,Activity,ChartNoAxesCombined,CircleHelp} from "lucide-react";
const groups=[
{category:"Getting Started",items:[
["What is Terviq AI?","Terviq AI is presenting a member-focused digital opportunity experience alongside its agricultural artificial intelligence business. Specific earning activities and terms will be published when approved."],
["How do I create an account?","Use the Sign Up page to review the planned registration fields. Member registration is not open yet, so submitting the preview form will not create an account."],
["Is registration free?","A confirmed registration fee policy is not currently published. Check the official terms before providing payment or personal information."],
["What information do I need to register?","The planned form requests a name, email, phone number and country. Final requirements will be confirmed before registration opens."],
["Can I register using my phone?","The website is designed to be responsive on smartphones. Account registration is not yet open."],
["Which countries can join?","Country eligibility has not yet been published. Do not assume availability in a particular country until an official eligibility list is provided."],
["Can I access Terviq AI from Ghana?","Ghana-specific membership availability has not been confirmed publicly."],
["Can I access Terviq AI from Nigeria?","Nigeria-specific membership availability has not been confirmed publicly."],
["Can I use Terviq AI outside West Africa?","International membership eligibility has not been published. The company's international outlook does not itself confirm member access in every country."],
["How do I log into my account?","Member login is not active yet. The Login page will be the entry point when member access opens."],
["What should I do if I forget my password?","Password recovery will be documented when the member account service is available. Do not share your password with anyone."],
["How do I verify my account?","Identity or contact verification requirements have not been confirmed. Any required checks should be explained in the official account terms."],
["Can I change my registered email address?","Email-change procedures will be published with the account rules when registration becomes available."],
["Can I change my phone number?","Phone-number update procedures have not yet been published."]
]},
{category:"Earning Opportunities",items:[
["How can I earn money on Terviq AI?","The company has not yet published an approved list of member earning activities or reward rules. No specific earning method or amount should be assumed."],
["What earning opportunities are available?","Approved opportunities will be listed here when their participation rules, eligibility and reward calculations are confirmed."],
["Are there daily earning activities?","Daily activities have not been confirmed. Terviq AI does not currently publish a daily earning promise."],
["How do I participate in available tasks?","Task instructions and eligibility requirements will accompany each approved activity when the programme is launched."],
["How are rewards calculated?","Reward calculations have not been published. Any future activity should explain its calculation method before you participate."],
["When are completed activities credited?","Credit timing has not been confirmed. It should be stated in the rules for each activity."],
["Can I participate in multiple earning activities?","Participation limits have not been published and will depend on the approved programme rules."],
["Are earning activities available every day?","Availability schedules have not been confirmed. Do not assume activities are available daily."],
["How do I know which activities I qualify for?","Eligibility criteria will be displayed with each approved opportunity. No eligibility rules are currently published."],
["Are earnings guaranteed?","No. Terviq AI does not publish or promise guaranteed earnings. Any future rewards will be subject to published activity rules and eligibility."],
["Can I earn using only my smartphone?","The website is designed for mobile use. Whether a specific activity can be completed on a phone will depend on that activity's instructions."],
["How can I track my earnings?","A sample dashboard illustrates how account activity could be displayed. It is not connected to member records and does not show real earnings."]
]},
{category:"Referral Program",items:[
["Does Terviq AI have a referral program?","A referral programme is part of the planned member experience, but its approved terms and availability have not yet been published."],
["How do I invite friends?","Referral links and invitation instructions will be provided if and when the programme opens."],
["Where can I find my referral link?","No live referral link is currently available. A sample referral area is illustrative only."],
["How do I share my referral link?","Sharing instructions will be provided with the official referral programme rules."],
["How are referrals tracked?","Referral attribution and tracking rules have not yet been published."],
["When do referral commissions become payable?","No commission payment schedule is currently published."],
["Can I refer people from other countries?","Cross-border referral eligibility has not been confirmed."],
["Can I see how many people have joined through me?","A sample dashboard includes an illustrative referral activity panel. Live referral counts are not currently available."],
["What happens if someone registers without my referral link?","Referral attribution rules have not yet been published."],
["Are there referral commission conditions?","Any qualifying conditions, exclusions and commission rules must be published before the programme is promoted. No commission percentage or guaranteed income is stated here."]
]},
{category:"Withdrawals and Payments",items:[
["How do I withdraw my earnings?","A live withdrawal service and its procedures have not been confirmed. Withdrawal instructions will be published before members are invited to request payments."],
["What is the minimum withdrawal amount?","The minimum withdrawal amount has not been provided by the company and is not published."],
["What is the maximum withdrawal amount?","No maximum withdrawal limit has been confirmed."],
["Which banks are supported?","Supported banks have not been confirmed."],
["Can I withdraw to my Nigerian bank account?","Nigerian bank withdrawal availability has not been confirmed."],
["Can I withdraw to mobile money?","Mobile-money support has not been confirmed."],
["How long do withdrawals take?","No withdrawal processing time has been approved or published."],
["Are there withdrawal charges?","Withdrawal fees have not been confirmed. Review official terms before requesting or paying any charge."],
["Why is my withdrawal pending?","A pending-withdrawal status is shown only as a sample dashboard concept. There is no live withdrawal service described here."],
["What happens if my withdrawal fails?","A failed-payment support process has not yet been published."],
["Can I cancel a withdrawal request?","Cancellation rules have not yet been published."],
["Where can I see my withdrawal history?","The sample dashboard includes a withdrawal-history area, but it is not connected to real transactions."],
["Do I need to verify my account before withdrawing?","Verification requirements have not been confirmed."],
["Can I withdraw my entire available balance?","Withdrawal limits and available-balance rules have not been published."]
]},
{category:"Account and Security",items:[
["Can I have more than one account?","The multiple-account policy has not yet been published. Check the official terms before creating additional accounts."],
["How do I protect my account?","Use a unique password, keep it private, avoid shared devices where possible and never disclose one-time codes or passwords to anyone claiming to be support."],
["What should I do if I suspect unauthorized access?","When member support becomes available, report suspected access immediately and follow the account recovery instructions. Do not share credentials in public messages."],
["Can I change my password?","Password-change instructions will be included in the account help materials when login is available."],
["How do I update my account information?","Profile update procedures have not yet been published."],
["Can I temporarily deactivate my account?","Account deactivation rules have not yet been published."],
["How can I contact customer support?","Use the Contact page for company and partnership inquiries. A dedicated member-support channel has not been confirmed."]
]},
{category:"Understanding Terviq AI",items:[
["What makes Terviq AI different?","Terviq AI combines a member opportunity platform direction with a separate agricultural technology business. The company is retaining its agricultural AI foundation while developing a more member-centred experience."],
["Is Terviq AI a Norwegian company?","The company describes itself as having Norwegian origins."],
["When was Terviq AI established?","Terviq AI states that it was established in 2019."],
["What does agriculture have to do with the platform?","Agricultural technology is part of Terviq AI's underlying business focus. Its capabilities include precision agriculture, crop intelligence, smart irrigation and agricultural analytics."],
["How does Terviq AI generate business revenue?","The repository describes agricultural technology capabilities, but does not provide verified revenue figures or a detailed revenue model. No unsupported revenue claims are made here."],
["Why does Terviq AI work with artificial intelligence?","AI can help organize agricultural data, identify patterns and support operational decisions across farms and agribusinesses."],
["How do agricultural technologies support the company's business?","The agricultural AI business is the company's technology foundation. The exact financial relationship between that business and member rewards has not been documented publicly."],
["Is Terviq AI expanding into West Africa?","West Africa is a stated area of ambition. Specific operating locations, launch dates and country coverage have not been confirmed."]
]},
{category:"Investments and Partnerships",items:[
["Can I invest in Terviq AI?","The website welcomes investor inquiries, but it does not offer an investment product or securities subscription. Contact the company for verified, formal information."],
["How can I become a strategic partner?","Use the Contact page to describe your organization and the collaboration you would like to explore."],
["How can an agricultural company work with Terviq AI?","Agricultural businesses can make an inquiry about precision agriculture, crop intelligence, farm management, irrigation analytics or enterprise AI."],
["Is the membership program the same as an investment?","No. Membership, any future referral rewards and a separately documented investment are distinct. Registering as a member does not make someone an investor."],
["Where can I find official investment information?","Use the Investors & Partners page and contact Terviq AI directly. Any formal investment opportunity would require separate legal documentation and disclosures."]
]}
];
export function EarningFAQ(){const[category,setCategory]=useState("All");const[query,setQuery]=useState("");const[active,setActive]=useState<string|null>(null);const categories=["All",...groups.map(g=>g.category)];const results=useMemo(()=>groups.flatMap(g=>g.items.map(([q,a])=>({q,a,category:g.category}))).filter(x=>(category==="All"||x.category===category)&&(!query||(`${x.q} ${x.a}`).toLowerCase().includes(query.toLowerCase()))),[category,query]);return <div className="faq-explorer"><label className="faq-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search accounts, earning rules, referrals, withdrawals…"/></label><div className="faq-categories">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="faq-list">{results.map(x=><article className="faq-item" key={x.q}><button onClick={()=>setActive(active===x.q?null:x.q)} aria-expanded={active===x.q}><span><small>{x.category}</small>{x.q}</span><ChevronDown className={active===x.q?"rotate":""} size={18}/></button>{active===x.q&&<p>{x.a}</p>}</article>)}{results.length===0&&<p className="faq-empty">No matching questions. Try another search or contact Terviq AI.</p>}</div></div>}
export function DashboardPreview(){return <div className="dashboard-shell"><div className="dashboard-top"><div><span className="dash-overline">MEMBER OVERVIEW</span><h3>Your activity at a glance</h3></div><span className="sample-tag"><span/> ILLUSTRATIVE PREVIEW</span></div><div className="dashboard-stats"><div className="dash-stat"><span>Available balance</span><strong>₦0.00</strong><small><Wallet size={14}/> Sample display</small></div><div className="dash-stat"><span>Total rewards</span><strong>₦0.00</strong><small><ChartNoAxesCombined size={14}/> Sample display</small></div><div className="dash-stat"><span>Pending rewards</span><strong>₦0.00</strong><small><Clock3 size={14}/> Sample display</small></div><div className="dash-stat"><span>Referrals</span><strong>0</strong><small><Users size={14}/> Sample display</small></div></div><div className="dashboard-lower"><div className="dash-panel"><div className="dash-panel-head"><b>Recent activity</b><span>Example layout</span></div><div className="dash-transaction"><span className="transaction-icon"><Gift size={16}/></span><div><b>Approved activity reward</b><small>Example transaction</small></div><strong>—</strong></div><div className="dash-transaction"><span className="transaction-icon"><Users size={16}/></span><div><b>Referral activity</b><small>Example transaction</small></div><strong>—</strong></div><div className="dash-transaction"><span className="transaction-icon"><ArrowDownLeft size={16}/></span><div><b>Withdrawal record</b><small>Example transaction</small></div><strong>—</strong></div></div><div className="dash-panel dash-quick"><div className="dash-panel-head"><b>Member tools</b><span>Preview</span></div><Link href="/ways-to-earn"><Activity size={16}/> Earning opportunities <ArrowUpRight size={14}/></Link><Link href="/referrals"><Users size={16}/> Referral programme <ArrowUpRight size={14}/></Link><Link href="/withdrawals"><Wallet size={16}/> Withdrawals <ArrowUpRight size={14}/></Link><Link href="/faq"><CircleHelp size={16}/> Help centre <ArrowUpRight size={14}/></Link></div></div><p className="dashboard-disclaimer"><ShieldCheck size={15}/> Illustrative interface only. These are not live balances, customer earnings, transactions or payout records.</p></div>}
export function MemberAuthForm({signup=false}:{signup?:boolean}){const[show,setShow]=useState(false);const[message,setMessage]=useState("");const[password,setPassword]=useState("");const[confirm,setConfirm]=useState("");const strength=password.length===0?0:password.length<8?1:password.length<12?2:/[A-Z]/.test(password)&&/[0-9]/.test(password)&&/[^A-Za-z0-9]/.test(password)?4:3;function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage("");if(signup&&password!==confirm){setMessage("Your passwords do not match. Please check and try again.");return;}setMessage(signup?"Your registration details have been checked.":"Please check your login details and try again.");}return <form className="member-form" onSubmit={submit}>{signup&&<><label>Full name<input required autoComplete="name" placeholder="Enter your full name"/></label><label>Username <span className="field-optional">Optional, if assigned</span><input autoComplete="username" placeholder="Choose a username"/></label></>}<label>Email address or username<input required autoComplete="username" placeholder="you@example.com"/></label>{signup&&<><label>Phone number<input type="tel" autoComplete="tel" placeholder="+234 800 000 0000" required/></label><label>Country<select required defaultValue=""><option value="" disabled>Select your country</option>{["Nigeria","Ghana","Sierra Leone","Liberia","The Gambia","Other"].map(x=><option key={x}>{x}</option>)}</select></label></>}<label>Password<div className="password-wrap"><input required type={show?"text":"password"} minLength={8} autoComplete={signup?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/><button type="button" aria-label={show?"Hide password":"Show password"} onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>{signup&&<><div className="password-strength"><div className="strength-bars">{[1,2,3,4].map(n=><i key={n} className={strength>=n?"filled":""}/>)}</div><small>{["Enter a password","Weak","Fair","Good","Strong"][strength]}</small></div><label>Confirm password<input required type={show?"text":"password"} minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter password again"/></label><label>Referral code <span className="field-optional">Optional</span><input placeholder="Enter a referral code if you have one"/></label><label className="member-consent"><input type="checkbox" required/> I agree to the <Link href="/terms">Terms of Use</Link> and <Link href="/privacy">Privacy Policy</Link>.</label></>}{!signup&&<div className="member-form-meta"><label className="member-consent"><input type="checkbox"/> Remember me</label><Link href="/contact">Forgot password?</Link></div>}<button className="btn btn-green full-btn" type="submit">{signup?"Create account":"Login"} <ArrowUpRight size={16}/></button>{message&&<p className="auth-feedback" role="status">{message}</p>}<p className="auth-security"><LockKeyhole size={14}/> Never share your password or verification codes.</p></form>}
