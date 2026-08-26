
import { CAP, CREATIVE_TYPES, NODE_STATUS } from "./capabilities.js";

export function makeProvider({id,name,capabilities,cost=1,latency=1,quality={},enabled=true,kind="NATIVE"}){
  return {id,name,capabilities:[...capabilities],cost,latency,quality,enabled,kind};
}

export function defaultProviders(){
  return [
    makeProvider({
      id:"awla-native", name:"AWLA Native / Cloudflare",
      capabilities:[CAP.GENERATE_ENVIRONMENT,CAP.GENERATE_IMAGE],
      cost:.2, latency:.6, quality:{luxury:.65,productFidelity:.4,environment:.78}, kind:"NATIVE"
    }),
    makeProvider({
      id:"product-lock", name:"AWLA Product Lock",
      capabilities:[CAP.PRODUCT_LOCK,CAP.COMPOSITE_PRODUCT],
      cost:.05, latency:.2, quality:{productFidelity:.95}, kind:"INTERNAL"
    }),
    makeProvider({
      id:"layout", name:"AWLA Layout Engine",
      capabilities:[CAP.LAYOUT,CAP.EXPORT,CAP.GENERATE_COPY],
      cost:.01, latency:.1, quality:{layout:.8}, kind:"INTERNAL"
    }),
    makeProvider({
      id:"qc", name:"AWLA Visual QC",
      capabilities:[CAP.VISUAL_QC,CAP.BRAND_QC],
      cost:.03, latency:.1, quality:{qc:.75}, kind:"INTERNAL"
    }),
    makeProvider({
      id:"higgsfield", name:"Higgsfield",
      capabilities:[CAP.GENERATE_IMAGE,CAP.EDIT_IMAGE],
      cost:1.6, latency:.8, quality:{humanRealism:.9,luxury:.82,productFidelity:.68}, enabled:false, kind:"PREMIUM"
    }),
    makeProvider({
      id:"magnific", name:"Magnific",
      capabilities:[CAP.UPSCALE,CAP.EDIT_IMAGE],
      cost:.8, latency:.7, quality:{upscale:.92,luxury:.86}, enabled:false, kind:"PREMIUM"
    })
  ];
}

export function requiredCapabilities(creativeType){
  switch(creativeType){
    case CREATIVE_TYPES.PRODUCT_HERO:
      return [CAP.GENERATE_ENVIRONMENT,CAP.PRODUCT_LOCK,CAP.COMPOSITE_PRODUCT,CAP.VISUAL_QC,CAP.BRAND_QC,CAP.EXPORT];
    case CREATIVE_TYPES.STILL_LIFE:
      return [CAP.GENERATE_ENVIRONMENT,CAP.PRODUCT_LOCK,CAP.COMPOSITE_PRODUCT,CAP.VISUAL_QC,CAP.BRAND_QC,CAP.EXPORT];
    case CREATIVE_TYPES.CLEAN_SOCIAL:
      return [CAP.PRODUCT_LOCK,CAP.LAYOUT,CAP.GENERATE_COPY,CAP.VISUAL_QC,CAP.BRAND_QC,CAP.EXPORT];
    case CREATIVE_TYPES.TYPOGRAPHY_POST:
      return [CAP.LAYOUT,CAP.GENERATE_COPY,CAP.BRAND_QC,CAP.EXPORT];
    case CREATIVE_TYPES.CAROUSEL:
      return [CAP.LAYOUT,CAP.GENERATE_COPY,CAP.BRAND_QC,CAP.EXPORT];
    case CREATIVE_TYPES.REPURPOSE:
      return [CAP.LAYOUT,CAP.BRAND_QC,CAP.EXPORT];
    default:
      throw new Error(`Unsupported creative type: ${creativeType}`);
  }
}

function providerScore(p, cap, mode="balanced"){
  const q = Math.max(...Object.values(p.quality||{default:.5}));
  if(mode==="quality") return q*3 - p.cost*.25 - p.latency*.1;
  if(mode==="economy") return q - p.cost*2 - p.latency*.1;
  return q*2 - p.cost - p.latency*.25;
}

export function buildExecutionGraph(contentUnit, providers, mode="balanced"){
  const required = requiredCapabilities(contentUnit.creativeType);
  const nodes = required.map((cap, index)=>{
    const candidates = providers.filter(p=>p.enabled && p.capabilities.includes(cap))
      .sort((a,b)=>providerScore(b,cap,mode)-providerScore(a,cap,mode));
    if(!candidates.length) return {id:`n${index+1}`,capability:cap,status:NODE_STATUS.BLOCKED,provider:null,error:"NO_PROVIDER"};
    return {id:`n${index+1}`,capability:cap,status:NODE_STATUS.PENDING,provider:candidates[0].id,candidates:candidates.map(x=>x.id),attempts:0};
  });
  return {id:crypto.randomUUID(),contentUnitId:contentUnit.id,mode,nodes,status:nodes.some(n=>n.status===NODE_STATUS.BLOCKED)?"BLOCKED":"READY"};
}

export function retryPlan(graph, failedNodeId){
  const idx=graph.nodes.findIndex(n=>n.id===failedNodeId);
  if(idx<0) throw new Error("Failed node not found");
  return graph.nodes.slice(idx).map(n=>n.id);
}
