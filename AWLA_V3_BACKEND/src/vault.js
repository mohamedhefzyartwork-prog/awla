
function b64(bytes){ return btoa(String.fromCharCode(...bytes)); }
function unb64(s){ const bin=atob(s); return Uint8Array.from(bin,c=>c.charCodeAt(0)); }

async function masterKey(env){
  if(!env.MASTER_KEY) throw new Error("MASTER_KEY secret is not configured");
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.MASTER_KEY));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt","decrypt"]);
}

export async function encryptSecret(env, value){
  const key=await masterKey(env), iv=crypto.getRandomValues(new Uint8Array(12));
  const enc=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(value));
  return {encrypted:b64(new Uint8Array(enc)),iv:b64(iv)};
}

export async function decryptSecret(env, encrypted, iv){
  const key=await masterKey(env);
  const raw=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(iv)},key,unb64(encrypted));
  return new TextDecoder().decode(raw);
}
