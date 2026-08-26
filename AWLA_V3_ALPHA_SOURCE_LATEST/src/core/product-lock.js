
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.src=src;
  });
}

export async function extractProduct(dataUrl,{tolerance=30,maxSide=1200}={}){
  const img=await loadImage(dataUrl);
  const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
  const w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
  const src=document.createElement("canvas");src.width=w;src.height=h;
  const ctx=src.getContext("2d",{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
  const original=ctx.getImageData(0,0,w,h);

  function attempt(tol){
    const im=new ImageData(new Uint8ClampedArray(original.data),w,h),d=im.data;
    const pts=[[2,2],[w-3,2],[2,h-3],[w-3,h-3],[Math.floor(w/2),2],[Math.floor(w/2),h-3],[2,Math.floor(h/2)],[w-3,Math.floor(h/2)]];
    const samples=pts.map(([x,y])=>{const i=(y*w+x)*4;return[d[i],d[i+1],d[i+2]]});
    const bg=samples.reduce((a,s)=>a.map((v,i)=>v+s[i]),[0,0,0]).map(v=>v/samples.length);
    const spread=Math.max(...samples.flatMap(s=>s.map((v,i)=>Math.abs(v-bg[i]))));
    if(spread>50) throw new Error("BACKGROUND_NOT_CLEAN");

    const seen=new Uint8Array(w*h),q=new Int32Array(w*h),mask=new Uint8Array(w*h);let head=0,tail=0;
    function similar(idx){
      const i=idx*4,dr=d[i]-bg[0],dg=d[i+1]-bg[1],db=d[i+2]-bg[2];
      const dist=Math.sqrt(dr*dr+dg*dg+db*db),bright=(d[i]+d[i+1]+d[i+2])/3;
      return dist<tol && bright>Math.max(145,(bg[0]+bg[1]+bg[2])/3-75);
    }
    function push(idx){if(idx<0||idx>=w*h||seen[idx])return;seen[idx]=1;if(similar(idx))q[tail++]=idx}
    for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}
    for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
    while(head<tail){
      const idx=q[head++];mask[idx]=1;const x=idx%w,y=(idx/w)|0;
      if(x>0)push(idx-1);if(x<w-1)push(idx+1);if(y>0)push(idx-w);if(y<h-1)push(idx+w);
    }
    let kept=0,minX=w,minY=h,maxX=-1,maxY=-1;
    for(let i=0;i<w*h;i++){
      if(mask[i]) d[i*4+3]=0;
      else{
        kept++;const x=i%w,y=(i/w)|0;
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
    return {im,ratio:kept/(w*h),bbox:{minX,minY,maxX,maxY}};
  }

  let used=Math.max(8,Math.min(60,tolerance)),res=attempt(used);
  if(res.ratio<.035){used=Math.max(8,Math.round(used*.45));res=attempt(used)}
  if(res.ratio<.02) throw new Error("FOREGROUND_TOO_SMALL");
  if(res.ratio>.82) throw new Error("BACKGROUND_NOT_REMOVED");

  const full=document.createElement("canvas");full.width=w;full.height=h;
  full.getContext("2d").putImageData(res.im,0,0);
  const b=res.bbox,pad=5;
  const left=Math.max(0,b.minX-pad),top=Math.max(0,b.minY-pad);
  const right=Math.min(w-1,b.maxX+pad),bottom=Math.min(h-1,b.maxY+pad);
  const cw=right-left+1,ch=bottom-top+1;
  const crop=document.createElement("canvas");crop.width=cw;crop.height=ch;
  crop.getContext("2d").drawImage(full,left,top,cw,ch,0,0,cw,ch);
  return {canvas:crop,width:cw,height:ch,foregroundRatio:res.ratio,toleranceUsed:used};
}

export function compositeProduct({environment,product,canvasSize=1024,shadow=.28,placement={x:.5,y:.53,maxW:.74,maxH:.74}}){
  const c=document.createElement("canvas");c.width=canvasSize;c.height=canvasSize;const x=c.getContext("2d");
  x.drawImage(environment,0,0,canvasSize,canvasSize);
  const s=Math.min(canvasSize*placement.maxW/product.width,canvasSize*placement.maxH/product.height);
  const w=product.width*s,h=product.height*s,left=canvasSize*placement.x-w/2,top=canvasSize*placement.y-h/2;

  x.save();x.globalAlpha=Math.max(0,Math.min(.5,shadow));x.filter=`blur(${Math.round(canvasSize*.024)}px)`;x.fillStyle="#000";
  x.beginPath();x.ellipse(canvasSize*placement.x,Math.min(canvasSize*.93,top+h*.92),Math.max(60,w*.28),Math.max(12,h*.045),0,0,Math.PI*2);x.fill();x.restore();
  x.drawImage(product.canvas,left,top,w,h);
  return c;
}
