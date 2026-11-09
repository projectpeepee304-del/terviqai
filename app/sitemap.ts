import type {MetadataRoute} from "next";
export default function sitemap():MetadataRoute.Sitemap{return ["","about","solutions","industries","work","investors","mission","faq","contact","privacy","terms"].map(path=>({url:"https://terviqai.com"+(path?"/"+path:""),lastModified:new Date(),changeFrequency:"monthly",priority:path===""?1:(path==="solutions"||path==="about"?0.9:0.7)}))}
