
import { ToolAdapter } from "./base.js";
import { extractProduct, compositeProduct } from "../core/product-lock.js";

export class ProductLockAdapter extends ToolAdapter {
  constructor(){super({id:"product-lock",capabilities:["PRODUCT_LOCK","COMPOSITE_PRODUCT"]})}
  async execute({node,context,results}){
    if(node.capability==="PRODUCT_LOCK"){
      if(!context.productDataUrl) throw new Error("PRODUCT_ASSET_REQUIRED");
      return await extractProduct(context.productDataUrl,context.productLockOptions||{});
    }
    if(node.capability==="COMPOSITE_PRODUCT"){
      const product=Object.values(results).find(x=>x?.canvas && x?.foregroundRatio!=null);
      const env=Object.values(results).find(x=>x?.environmentBitmap)?.environmentBitmap || context.environmentBitmap;
      if(!product) throw new Error("PRODUCT_LOCK_RESULT_REQUIRED");
      if(!env) throw new Error("ENVIRONMENT_REQUIRED");
      return {canvas:compositeProduct({environment:env,product,shadow:context.shadow??.28})};
    }
    throw new Error(`Unsupported capability ${node.capability}`);
  }
}
