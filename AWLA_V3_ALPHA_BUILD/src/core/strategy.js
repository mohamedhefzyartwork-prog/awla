
import { CREATIVE_TYPES } from "./capabilities.js";

export function buildVisualDNA(brand){
  return {
    market: brand.market,
    tone: brand.tone,
    palette: brand.palette.length ? brand.palette : ["warm-neutral", "deep-charcoal", "soft-ivory"],
    lighting: "controlled editorial luxury lighting",
    composition: "product-first with intentional negative space",
    materials: ["stone", "brushed metal", "matte mineral", "soft reflective acrylic"],
    typography: brand.typography.length ? brand.typography : ["clean premium sans-serif"],
    guardrails: [...brand.alwaysRules, ...brand.neverRules.map(x=>`NEVER: ${x}`)]
  };
}

export function planCampaign(state, {title="Monthly Campaign", objective} = {}){
  const campaign = state.addCampaign({title, objective: objective || state.brand.objective});
  campaign.visualDNA = buildVisualDNA(state.brand);

  const prioritized = [...state.skus].sort((a,b)=>{
    const score = s => (s.references?.length ? 2 : 0) + (s.status==="ACTIVE" ? 1 : 0);
    return score(b)-score(a);
  }).slice(0, 6);

  prioritized.forEach((sku, i)=>{
    const role = i===0 ? "HERO" : (i<4 ? "HUB" : "HELP");
    const creativeType =
      role==="HERO" ? CREATIVE_TYPES.PRODUCT_HERO :
      role==="HUB" ? CREATIVE_TYPES.STILL_LIFE :
      CREATIVE_TYPES.CLEAN_SOCIAL;

    const unit = state.addContentUnit({
      campaignId: campaign.id,
      skuId: sku.id,
      role,
      creativeType,
      format: role==="HERO" ? "4:5" : "1:1",
      objective: campaign.objective,
      visualBrief: createVisualBrief(state.brand, campaign.visualDNA, sku, role, creativeType)
    });
    campaign.contentUnitIds.push(unit.id);
  });

  return campaign;
}

export function createVisualBrief(brand, dna, sku, role, type){
  const productLock = `Use exact SKU identity from references. ${sku.immutableRules.join(". ")}.`;
  const env = `World-class luxury jewelry art direction for ${brand.market}: ${dna.lighting}, ${dna.composition}, materials ${dna.materials.join(", ")}, palette ${dna.palette.join(", ")}.`;
  const roleText = role==="HERO" ? "High-impact hero visual with strong campaign thesis." :
                   role==="HUB" ? "Elegant repeatable discovery visual." :
                   "Clean useful product-focused visual.";
  return `${roleText} ${env} ${productLock} Creative type: ${type}.`;
}
