
export function scoreQc({sku, brand, outputMeta={}}){
  const checks = [];
  const push=(code,weight,pass,detail)=>checks.push({code,weight,pass,detail});
  push("SKU_REFERENCES",25,sku.references?.length>0,"SKU should have at least one approved reference.");
  push("IMMUTABLE_RULES",20,(sku.immutableRules?.length||0)>=3,"SKU identity rules should be explicit.");
  push("PRODUCT_LOCK",25,outputMeta.productLock===true,"Commercial jewelry output should use Product Lock.");
  push("BRAND_RULES",15,(brand.alwaysRules?.length||0)>0 && (brand.neverRules?.length||0)>0,"Brand guardrails must exist.");
  push("ARTIFACTS",15,outputMeta.artifactFree!==false,"No known artifact flag.");

  const earned=checks.reduce((s,c)=>s+(c.pass?c.weight:0),0);
  const criticalFail=checks.some(c=>["SKU_REFERENCES","PRODUCT_LOCK"].includes(c.code) && !c.pass);
  return {
    score: earned,
    criticalFail,
    decision: !criticalFail && earned>=80 ? "PASS" : "FAIL",
    checks
  };
}

export function approvalGate(qc){
  if(qc.criticalFail) return {state:"BLOCKED",reason:"Critical SKU fidelity gate failed"};
  if(qc.score>=90) return {state:"READY_FOR_APPROVAL",reason:"High QC score"};
  if(qc.score>=80) return {state:"REVIEW",reason:"Passes minimum QC but requires human review"};
  return {state:"REVISE",reason:"QC below release threshold"};
}
