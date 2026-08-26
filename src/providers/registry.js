
export const PROVIDERS = Object.freeze({
  "awla-native": {
    id:"awla-native", name:"AWLA Native / Cloudflare", auth:"NONE",
    capabilities:["GENERATE_ENVIRONMENT","GENERATE_IMAGE"],
    status:"NATIVE"
  },
  "higgsfield": {
    id:"higgsfield", name:"Higgsfield", auth:"OAUTH_MCP",
    capabilities:["GENERATE_IMAGE","EDIT_IMAGE","GENERATE_VIDEO","REFERENCE_ELEMENTS"],
    status:"CONNECTOR_READY"
  },
  "magnific": {
    id:"magnific", name:"Magnific / Freepik API", auth:"API_KEY",
    capabilities:["UPSCALE","ENHANCE","EDIT_IMAGE"],
    status:"CREDENTIAL_REQUIRED"
  },
  "fal": {
    id:"fal", name:"fal.ai", auth:"API_KEY",
    capabilities:["GENERATE_IMAGE","EDIT_IMAGE","GENERATE_VIDEO","UPSCALE"],
    status:"CREDENTIAL_REQUIRED"
  }
});

export function publicProviders(){
  return Object.values(PROVIDERS).map(({auth,...x})=>({...x,authType:auth}));
}
