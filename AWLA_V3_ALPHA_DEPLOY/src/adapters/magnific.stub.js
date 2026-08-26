
import { ToolAdapter } from "./base.js";
export class MagnificAdapter extends ToolAdapter {
  constructor(){ super({id:"magnific",capabilities:["UPSCALE","EDIT_IMAGE"]}); }
  async health(){ return {ok:false,requiresCredential:true,reason:"Official API credential required"}; }
  async execute(){ throw new Error("Magnific API credential not configured"); }
}
