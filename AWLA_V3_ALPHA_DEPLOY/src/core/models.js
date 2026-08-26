
export function makeBrand(input = {}) {
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name || "Untitled Brand",
    market: input.market || "Saudi Arabia",
    category: input.category || "Jewelry",
    objective: input.objective || "Product discovery",
    tone: input.tone || "Premium, restrained, modern",
    palette: input.palette || [],
    typography: input.typography || [],
    alwaysRules: input.alwaysRules || [
      "Preserve product identity",
      "Keep claims evidence-safe",
      "Use premium product-first art direction"
    ],
    neverRules: input.neverRules || [
      "Invent claims",
      "Change SKU geometry",
      "Use fake urgency"
    ],
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function makeSku(input = {}) {
  return {
    id: input.id || crypto.randomUUID(),
    brandId: input.brandId || null,
    name: input.name || "Untitled SKU",
    skuCode: input.skuCode || "",
    category: input.category || "Jewelry",
    metal: input.metal || "",
    stones: input.stones || [],
    immutableRules: input.immutableRules || [
      "Preserve silhouette",
      "Preserve stone count and positions",
      "Preserve engravings",
      "Preserve proportions and hardware"
    ],
    references: input.references || [],
    approvedAngles: input.approvedAngles || [],
    status: input.status || "ACTIVE",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function makeCampaign(input = {}) {
  return {
    id: input.id || crypto.randomUUID(),
    brandId: input.brandId || null,
    title: input.title || "Monthly Campaign",
    objective: input.objective || "Product discovery",
    market: input.market || "Saudi Arabia",
    visualDNA: input.visualDNA || null,
    contentUnitIds: input.contentUnitIds || [],
    status: input.status || "PLANNING",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function makeContentUnit(input = {}) {
  return {
    id: input.id || crypto.randomUUID(),
    campaignId: input.campaignId || null,
    skuId: input.skuId || null,
    role: input.role || "HUB",
    creativeType: input.creativeType || "PRODUCT_HERO",
    format: input.format || "4:5",
    objective: input.objective || "Product discovery",
    visualBrief: input.visualBrief || "",
    executionGraph: input.executionGraph || null,
    approval: input.approval || { state: "UNREVIEWED", reasons: [] },
    qc: input.qc || null,
    createdAt: input.createdAt || new Date().toISOString()
  };
}

export function makeApprovalRecord(input = {}) {
  return {
    id: input.id || crypto.randomUUID(),
    contentUnitId: input.contentUnitId || null,
    state: input.state || "UNREVIEWED",
    reasons: input.reasons || [],
    iteration: input.iteration || 1,
    reviewer: input.reviewer || "human",
    createdAt: input.createdAt || new Date().toISOString()
  };
}
