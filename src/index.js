
import { encryptSecret, decryptSecret } from "./vault.js";
import { PROVIDERS, publicProviders } from "./providers/registry.js";
import { generateNative } from "./providers/awla-native.js";

const DEFAULT_WORKSPACE="default";

function cors(request,env){
  const origin=request.headers.get("Origin")||"";
  const allowed=(env.ALLOWED_ORIGIN||"").split(",").map(x=>x.trim()).filter(Boolean);
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin)?origin:(allowed[0]||"*"),
    "Access-Control-Allow-Headers":"Content-Type,Authorization",
    "Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS",
    "Vary":"Origin"
  };
}
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=utf-8",...headers}})}
function workspace(request){return request.headers.get("X-AWLA-Workspace")||DEFAULT_WORKSPACE;}
function id(){return crypto.randomUUID();}

async function saveConnection(request,env){
  const body=await request.json(),provider=PROVIDERS[body.providerId];
  if(!provider)return json({ok:false,error:"Unknown provider"},400);
  if(provider.auth==="NONE")return json({ok:false,error:"Provider requires no connection"},400);
  const ws=workspace(request),now=new Date().toISOString();
  let encrypted=null,iv=null,external=null;
  if(provider.auth==="API_KEY"){
    if(!body.apiKey)return json({ok:false,error:"apiKey is required"},400);
    const v=await encryptSecret(env,body.apiKey);encrypted=v.encrypted;iv=v.iv;
  }else{
    external=body.externalAccountId||null;
    if(!external)return json({ok:false,error:"OAuth/MCP account must be connected externally first"},409);
  }
  await env.DB.prepare(`INSERT INTO tool_connections
    (id,workspace_id,provider_id,auth_type,encrypted_secret,secret_iv,external_account_id,status,metadata_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(workspace_id,provider_id) DO UPDATE SET
    auth_type=excluded.auth_type,encrypted_secret=excluded.encrypted_secret,secret_iv=excluded.secret_iv,
    external_account_id=excluded.external_account_id,status='CONNECTED',metadata_json=excluded.metadata_json,updated_at=excluded.updated_at`)
    .bind(id(),ws,provider.id,provider.auth,encrypted,iv,external,"CONNECTED",JSON.stringify(body.metadata||{}),now,now).run();
  return json({ok:true,providerId:provider.id,status:"CONNECTED"});
}

async function listConnections(request,env){
  const ws=workspace(request);
  const rows=(await env.DB.prepare(`SELECT provider_id,auth_type,external_account_id,status,metadata_json,created_at,updated_at FROM tool_connections WHERE workspace_id=?`).bind(ws).all()).results||[];
  return json({ok:true,connections:rows.map(r=>({...r,metadata:JSON.parse(r.metadata_json||"{}"),metadata_json:undefined}))});
}
async function deleteConnection(request,env,providerId){
  await env.DB.prepare("DELETE FROM tool_connections WHERE workspace_id=? AND provider_id=?").bind(workspace(request),providerId).run();
  return json({ok:true});
}
async function getSecret(request,env,providerId){
  const row=await env.DB.prepare("SELECT encrypted_secret,secret_iv FROM tool_connections WHERE workspace_id=? AND provider_id=? AND status='CONNECTED'").bind(workspace(request),providerId).first();
  if(!row?.encrypted_secret)throw new Error(`Provider not connected: ${providerId}`);
  return decryptSecret(env,row.encrypted_secret,row.secret_iv);
}
async function logRun(env,{ws,contentUnitId,providerId,capability,modelId,status,estimatedCost=0,actualCost=0,latencyMs=0,error=null}){
  await env.DB.prepare(`INSERT INTO provider_runs(id,workspace_id,content_unit_id,provider_id,capability,model_id,status,estimated_cost,actual_cost,latency_ms,error,created_at)
  VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id(),ws,contentUnitId||null,providerId,capability,modelId||null,status,estimatedCost,actualCost,latencyMs,error,new Date().toISOString()).run();
}

async function generate(request,env){
  const body=await request.json(),ws=workspace(request),providerId=body.providerId||"awla-native";
  const started=Date.now();
  try{
    if(providerId==="awla-native"){
      const result=await generateNative(env,body);
      await logRun(env,{ws,contentUnitId:body.contentUnitId,providerId,capability:"GENERATE_ENVIRONMENT",modelId:body.engine||"dev",status:"PASSED",latencyMs:Date.now()-started});
      if(!result?.image) return json({ok:false,error:"Model returned no image"},502);
      const bin=Uint8Array.from(atob(result.image),c=>c.charCodeAt(0));
      return new Response(bin,{headers:{"content-type":"image/jpeg","cache-control":"no-store"}});
    }
    if(providerId==="higgsfield"){
      return json({ok:false,error:"Higgsfield execution is agent/MCP based and must use the connected Higgsfield service adapter, not a browser API key."},501);
    }
    // Credentials are securely retrievable for server-side adapters once provider endpoints are enabled.
    await getSecret(request,env,providerId);
    return json({ok:false,error:`${providerId} adapter endpoint is not enabled in Alpha yet`},501);
  }catch(e){
    await logRun(env,{ws,contentUnitId:body.contentUnitId,providerId,capability:"GENERATE_ENVIRONMENT",status:"FAILED",latencyMs:Date.now()-started,error:e.message}).catch(()=>{});
    return json({ok:false,error:e.message},500);
  }
}

export default {
 async fetch(request,env){
  const h=cors(request,env);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:h});
  const u=new URL(request.url);
  try{
    if(request.method==="GET" && (u.pathname==="/"||u.pathname==="/health"))
      return json({ok:true,service:"AWLA V3 API",providers:publicProviders(),d1:!!env.DB,ai:!!env.AI},200,h);
    if(request.method==="GET" && u.pathname==="/providers")return json({ok:true,providers:publicProviders()},200,h);
    if(request.method==="GET" && u.pathname==="/connections")return new Response((await listConnections(request,env)).body,{status:200,headers:h});
    if(request.method==="POST" && u.pathname==="/connections"){const r=await saveConnection(request,env);return new Response(r.body,{status:r.status,headers:{...Object.fromEntries(r.headers),...h}})}
    if(request.method==="DELETE" && u.pathname.startsWith("/connections/")){const r=await deleteConnection(request,env,u.pathname.split("/").pop());return new Response(r.body,{status:r.status,headers:{...Object.fromEntries(r.headers),...h}})}
    if(request.method==="POST" && u.pathname==="/generate"){const r=await generate(request,env);return new Response(r.body,{status:r.status,headers:{...Object.fromEntries(r.headers),...h}})}
    return json({ok:false,error:"Not found"},404,h);
  }catch(e){return json({ok:false,error:e.message||String(e)},500,h)}
 }
};
