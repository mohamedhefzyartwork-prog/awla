
import { makeBrand, makeSku, makeCampaign, makeContentUnit, makeApprovalRecord } from "./models.js";

export class AwlaState {
  constructor(seed = {}) {
    this.version = "3.0-alpha";
    this.brand = seed.brand ? makeBrand(seed.brand) : makeBrand();
    this.skus = (seed.skus || []).map(makeSku);
    this.campaigns = (seed.campaigns || []).map(makeCampaign);
    this.contentUnits = (seed.contentUnits || []).map(makeContentUnit);
    this.approvals = (seed.approvals || []).map(makeApprovalRecord);
    this.evidence = seed.evidence || [];
    this.providerRegistry = seed.providerRegistry || [];
    this.metrics = seed.metrics || { approvals: 0, rejections: 0, totalCost: 0, manualMinutes: 0 };
  }
  addSku(input){ const x = makeSku({...input, brandId:this.brand.id}); this.skus.push(x); return x; }
  addCampaign(input){ const x = makeCampaign({...input, brandId:this.brand.id, market:this.brand.market}); this.campaigns.push(x); return x; }
  addContentUnit(input){ const x = makeContentUnit(input); this.contentUnits.push(x); return x; }
  recordApproval(input){ const x = makeApprovalRecord(input); this.approvals.push(x); return x; }
  export(){ return JSON.parse(JSON.stringify(this)); }
}
