
import { NODE_STATUS } from "./capabilities.js";

export class ExecutionEngine {
  constructor({adapters={},maxAttempts=2}={}){
    this.adapters=adapters;
    this.maxAttempts=maxAttempts;
  }
  async run(graph,context={}){
    const results={};
    for(const node of graph.nodes){
      if(node.status==="BLOCKED") return {status:"BLOCKED",graph,results};
      node.status=NODE_STATUS.RUNNING;
      node.attempts=(node.attempts||0)+1;
      try{
        const adapter=this.adapters[node.provider];
        if(!adapter) throw new Error(`Adapter unavailable: ${node.provider}`);
        const result=await adapter.execute?.({node,context,results}) ?? {ok:true,simulated:true};
        results[node.id]=result;
        node.status=NODE_STATUS.PASSED;
      }catch(err){
        node.status=NODE_STATUS.FAILED;
        node.error=err.message;
        if(node.attempts<this.maxAttempts && node.candidates?.length>1){
          const idx=node.candidates.indexOf(node.provider);
          const fallback=node.candidates[idx+1];
          if(fallback){
            node.provider=fallback;
            node.status=NODE_STATUS.PENDING;
            return this.run(graph,context);
          }
        }
        return {status:"FAILED",failedNodeId:node.id,graph,results,error:err.message};
      }
    }
    graph.status="PASSED";
    return {status:"PASSED",graph,results};
  }
}
