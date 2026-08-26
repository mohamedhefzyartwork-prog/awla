
export async function callJson({url,apiKey,body,headers={}}){
  const started=Date.now();
  const r=await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`,...headers},
    body:JSON.stringify(body)
  });
  const text=await r.text();
  let data; try{data=JSON.parse(text)}catch{data={raw:text}}
  if(!r.ok) throw Object.assign(new Error(`Provider ${r.status}`),{status:r.status,data,latency:Date.now()-started});
  return {data,latency:Date.now()-started};
}
