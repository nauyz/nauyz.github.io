// Replace only local icon artwork; node coordinates and workflow remain unchanged.
(async()=>{
const {icons}=await fetch('icons.json').then(r=>r.json());
const ns='http://www.w3.org/2000/svg';
document.querySelectorAll('.node').forEach((node,i)=>{
 node.querySelector('.icon')?.remove();
 const hit=node.querySelector('.hit'),tile=document.createElementNS(ns,'rect');
 for(const [k,v] of Object.entries({x:-34,y:-34,width:68,height:68,rx:19,class:'hit'}))tile.setAttribute(k,v);
 hit.replaceWith(tile);
 const g=document.createElementNS(ns,'g');g.setAttribute('class','glyph');g.setAttribute('transform','translate(-18 -18)');g.innerHTML=icons[i];node.insertBefore(g,node.querySelector('text'));
});
window.detailIconsReady=true;
})();
