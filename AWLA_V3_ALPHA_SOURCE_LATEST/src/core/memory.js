
export function learnFromApprovals(state){
  const byReason = {};
  for(const a of state.approvals){
    for(const r of a.reasons||[]) byReason[r]=(byReason[r]||0)+1;
  }
  const mostFrequent = Object.entries(byReason).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return {
    total: state.approvals.length,
    approved: state.approvals.filter(a=>a.state==="APPROVED").length,
    rejected: state.approvals.filter(a=>a.state==="REJECTED").length,
    commonRevisionReasons: mostFrequent.map(([reason,count])=>({reason,count}))
  };
}
