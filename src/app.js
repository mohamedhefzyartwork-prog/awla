
import { AwlaState } from "./core/state.js";
import { planCampaign } from "./core/strategy.js";
import { defaultProviders, buildExecutionGraph } from "./core/router.js";
import { scoreQc, approvalGate } from "./core/qc.js";

export class AwlaV3 {
  constructor(seed={}){
    this.state=new AwlaState(seed);
    this.providers=defaultProviders();
  }
  addSku(input){ return this.state.addSku(input); }
  createCampaign(options={}){
    const campaign=planCampaign(this.state,options);
    for(const id of campaign.contentUnitIds){
      const unit=this.state.contentUnits.find(x=>x.id===id);
      unit.executionGraph=buildExecutionGraph(unit,this.providers,"balanced");
    }
    return campaign;
  }
  evaluateUnit(unitId,outputMeta={}){
    const unit=this.state.contentUnits.find(x=>x.id===unitId);
    if(!unit) throw new Error("Content unit not found");
    const sku=this.state.skus.find(x=>x.id===unit.skuId);
    const qc=scoreQc({sku,brand:this.state.brand,outputMeta});
    unit.qc=qc;
    return {qc,gate:approvalGate(qc)};
  }
  snapshot(){ return this.state.export(); }
}
