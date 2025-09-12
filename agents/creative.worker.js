import fs from "fs"; import path from "path";
const PRODUCT_ID=process.env.PRODUCT_ID; const R=+(process.env.REELS_PER_PRODUCT||1); const I=+(process.env.IMAGES_PER_PRODUCT||2);
setTimeout(()=>{ console.error("[Creative] timeout"); process.exit(1); }, 120000);
(async()=>{
  const date=new Date().toISOString().slice(0,10);
  const out=path.join(process.cwd(),"assets",PRODUCT_ID,date); fs.mkdirSync(out,{recursive:true});
  for(let i=1;i<=I;i++) fs.writeFileSync(path.join(out,`img_${i}.jpg`), Buffer.from(""));   // mocks
  for(let r=1;r<=R;r++) fs.writeFileSync(path.join(out,`reel_${r}.mp4`), Buffer.from(""));
  console.log(`[Creative:${PRODUCT_ID}] -> ${out}`); process.exit(0);
})();
