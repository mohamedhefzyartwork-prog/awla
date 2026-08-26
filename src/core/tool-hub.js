
export function toolStatus({registry,connections=[]}){
  const map=new Map(connections.map(c=>[c.provider_id||c.providerId,c]));
  return registry.map(p=>({
    id:p.id,name:p.name,kind:p.kind,
    capabilities:p.capabilities,
    connected:p.kind==="NATIVE"||p.kind==="INTERNAL"||map.get(p.id)?.status==="CONNECTED"
  }));
}

export function chooseToolForIntent({intent,providers,connections=[]}){
  const connected=new Set(connections.filter(c=>c.status==="CONNECTED").map(c=>c.providerId||c.provider_id));
  const usable=providers.filter(p=>p.enabled && (["NATIVE","INTERNAL"].includes(p.kind)||connected.has(p.id)));
  const prefer=(cap,qualityKey)=>{
    return usable.filter(p=>p.capabilities.includes(cap))
      .sort((a,b)=>(b.quality?.[qualityKey]||0)-(a.quality?.[qualityKey]||0) || (a.cost||0)-(b.cost||0))[0]||null;
  };
  if(intent==="EXACT_JEWELRY_HERO") return {
    environment:prefer("GENERATE_ENVIRONMENT","environment"),
    productLock:prefer("PRODUCT_LOCK","productFidelity"),
    qc:prefer("VISUAL_QC","qc")
  };
  if(intent==="EDITORIAL_MODEL") return {image:prefer("GENERATE_IMAGE","humanRealism")};
  if(intent==="UPSCALE") return {upscale:prefer("UPSCALE","upscale")};
  return {};
}
