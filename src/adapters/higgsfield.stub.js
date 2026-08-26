
import { ToolAdapter } from "./base.js";
export class HiggsfieldAdapter extends ToolAdapter {
  constructor(){ super({id:"higgsfield",capabilities:["GENERATE_IMAGE","EDIT_IMAGE"]}); }
  async health(){ return {ok:false,requiresConnection:true,reason:"OAuth/MCP connection required"}; }
  async execute(){ throw new Error("Higgsfield connection not configured"); }
}
