import type {MetadataRoute} from "next";
const routes=["","ways-to-earn","how-it-works","referrals","withdrawals","faq","about","agricultural-ai","solutions","dashboard","investors","industries","work","mission","contact","privacy","terms"];
export default function sitemap():MetadataRoute.Sitemap{return routes.map(path=>({url:"https://terviqai.com"+(path?"/"+path:""),lastModified:new Date(),changeFrequency:"monthly",priority:path===""?1:(["ways-to-earn","how-it-works","referrals","withdrawals","faq"].includes(path)?0.9:0.65)}))}
