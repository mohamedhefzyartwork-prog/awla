
export function rankProviders(providers,{capability,mode="balanced",taskProfile={}}){
  const weights = mode==="quality"
    ? {quality:4,cost:.4,latency:.2,reliability:1.3}
    : mode==="economy"
    ? {quality:1.6,cost:2.4,latency:.4,reliability:1}
    : {quality:2.6,cost:1.2,latency:.5,reliability:1.2};

  return providers
    .filter(p=>p.enabled && p.capabilities.includes(capability))
    .map(p=>{
      const qualities=Object.values(p.quality||{default:.5});
      const baseQuality=qualities.length?qualities.reduce((a,b)=>a+b,0)/qualities.length:.5;
      const taskBonus=Object.entries(taskProfile).reduce((sum,[k,v])=>sum+(p.quality?.[k]||0)*v,0);
      const reliability=p.reliability ?? .8;
      const score=(baseQuality+taskBonus)*weights.quality - (p.cost||0)*weights.cost - (p.latency||0)*weights.latency + reliability*weights.reliability;
      return {...p,score};
    })
    .sort((a,b)=>b.score-a.score);
}

export function estimateGraphCost(graph,providers){
  const map=new Map(providers.map(p=>[p.id,p]));
  const nodes=graph.nodes.map(n=>{
    const p=map.get(n.provider);
    return {nodeId:n.id,capability:n.capability,provider:n.provider,estimatedCost:p?.cost||0};
  });
  return {nodes,total:nodes.reduce((s,n)=>s+n.estimatedCost,0)};
}
