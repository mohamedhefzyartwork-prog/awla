
export class ApprovalMemory {
  constructor(records=[]){this.records=[...records]}
  add(record){this.records.push({...record,createdAt:record.createdAt||new Date().toISOString()});}
  summary(){
    const total=this.records.length;
    const approved=this.records.filter(x=>x.state==="APPROVED").length;
    const rejected=this.records.filter(x=>x.state==="REJECTED").length;
    const firstSecond=this.records.filter(x=>x.state==="APPROVED" && (x.iteration||99)<=2).length;
    const reasons={};
    for(const x of this.records)for(const r of x.reasons||[])reasons[r]=(reasons[r]||0)+1;
    return {
      total,approved,rejected,
      firstSecondPassRate: total?Math.round(firstSecond/total*100):0,
      commonReasons:Object.entries(reasons).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([reason,count])=>({reason,count}))
    };
  }
  recommendations(){
    const s=this.summary();
    return s.commonReasons.map(x=>({
      issue:x.reason,
      action:x.reason.includes("product")?"Increase Product Lock strictness / reference coverage":
             x.reason.includes("color")?"Strengthen brand color QC":
             "Review router node responsible for this rejection"
    }));
  }
}
