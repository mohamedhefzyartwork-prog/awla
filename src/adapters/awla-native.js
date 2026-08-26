
import { ToolAdapter } from "./base.js";
export class AwlaNativeAdapter extends ToolAdapter {
  constructor({baseUrl="https://awla-ai.mohamedhefzyartwork.workers.dev"}={}){
    super({id:"awla-native",capabilities:["GENERATE_ENVIRONMENT","GENERATE_IMAGE"]});
    this.baseUrl=baseUrl.replace(/\/$/,"");
  }
  async health(){
    const r=await fetch(this.baseUrl+"/health");
    if(!r.ok) return {ok:false,status:r.status};
    return await r.json();
  }
  async execute({node,context}){
    if(!["GENERATE_ENVIRONMENT","GENERATE_IMAGE"].includes(node.capability)) throw new Error(`Unsupported capability ${node.capability}`);
    const out=await this.generateEnvironment({prompt:context.visualBrief,width:1024,height:1024,steps:10,engine:context.engine||"dev"});
    const bitmap=await createImageBitmap(out.blob);
    return {environmentBitmap:bitmap,contentType:out.contentType};
  }
  async generateEnvironment({prompt,width=1024,height=1024,steps=10,engine="dev"}){
    const r=await fetch(`${this.baseUrl}/generate?engine=${engine}`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt,width,height,steps})
    });
    if(!r.ok) throw new Error(`AWLA Native ${r.status}`);
    return {contentType:r.headers.get("content-type"),blob:await r.blob()};
  }
}
