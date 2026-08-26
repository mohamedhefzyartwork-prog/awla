
import { ToolAdapter } from "./base.js";
import { scoreQc, approvalGate } from "../core/qc.js";

export class LayoutAdapter extends ToolAdapter {
  constructor(){super({id:"layout",capabilities:["LAYOUT","EXPORT","GENERATE_COPY"]})}
  async execute({node,context,results}){
    if(node.capability==="GENERATE_COPY") return {caption:context.caption||`اكتشف ${context.sku?.name||"المنتج"} ضمن ${context.brand?.name||"البراند"}.`};
    if(node.capability==="LAYOUT") return {layout:{format:context.format||"4:5",safeMargins:true}};
    if(node.capability==="EXPORT"){
      const composite=Object.values(results).find(x=>x?.canvas);
      return {ready:true,canvas:composite?.canvas||composite||null};
    }
    return {ok:true};
  }
}

export class QcAdapter extends ToolAdapter {
  constructor(){super({id:"qc",capabilities:["VISUAL_QC","BRAND_QC"]})}
  async execute({context,results}){
    const hasComposite=Object.values(results).some(x=>x?.canvas);
    const qc=scoreQc({sku:context.sku,brand:context.brand,outputMeta:{productLock:hasComposite,artifactFree:true}});
    return {qc,gate:approvalGate(qc)};
  }
}
