
export const QUALITY_MODES=Object.freeze({
  ECONOMY:{maxRetriesPerNode:1,maxEstimatedCostPerCreative:1.0,premiumAllowed:false},
  BALANCED:{maxRetriesPerNode:2,maxEstimatedCostPerCreative:4.0,premiumAllowed:true},
  MAXIMUM_QUALITY:{maxRetriesPerNode:3,maxEstimatedCostPerCreative:12.0,premiumAllowed:true}
});

export function enforceBudget({graph,estimate,mode="BALANCED"}){
  const policy=QUALITY_MODES[mode]||QUALITY_MODES.BALANCED;
  if(estimate.total>policy.maxEstimatedCostPerCreative){
    return {allowed:false,reason:"ESTIMATED_COST_EXCEEDS_MODE_LIMIT",policy,estimate};
  }
  return {allowed:true,policy,estimate};
}

export function retryDecision({attempts,mode="BALANCED",critical=false}){
  const p=QUALITY_MODES[mode]||QUALITY_MODES.BALANCED;
  if(critical && attempts>=1) return {retry:false,reason:"CRITICAL_FIDELITY_FAILURE_REQUIRES_REVIEW"};
  return attempts<p.maxRetriesPerNode
    ? {retry:true,reason:"WITHIN_RETRY_BUDGET"}
    : {retry:false,reason:"RETRY_BUDGET_EXHAUSTED"};
}
