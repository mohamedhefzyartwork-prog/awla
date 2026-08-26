
export class ToolAdapter {
  constructor(meta){ this.meta=meta; }
  supports(capability){ return this.meta.capabilities.includes(capability); }
  async health(){ return {ok:true,id:this.meta.id}; }
  async execute(){ throw new Error("execute() not implemented"); }
}
