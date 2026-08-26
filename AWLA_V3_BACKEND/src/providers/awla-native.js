
export async function generateNative(env, body){
  const model = body.engine==="fast"
    ? "@cf/black-forest-labs/flux-2-klein-4b"
    : "@cf/black-forest-labs/flux-2-dev";
  const form=new FormData();
  form.append("prompt",String(body.prompt||""));
  form.append("width",String(body.width||1024));
  form.append("height",String(body.height||1024));
  if(model.includes("flux-2-dev")) form.append("steps",String(Math.max(8,Math.min(12,Number(body.steps||10)))));
  const serialized=new Response(form);
  return env.AI.run(model,{multipart:{body:serialized.body,contentType:serialized.headers.get("content-type")}});
}
