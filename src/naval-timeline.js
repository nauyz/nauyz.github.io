// Original recording: 1797 frames at 30 fps. No cuts, reordering or substituted pages.
// Match destination changes, including transitions inside a feature; resume in place.
export const navalTimeline = [
  {id:'catalog',label:'目录',at:52/30,landing:55/30,home:573/30,box:[29,92,18,7],handY:0},
  {id:'catalog-answer',label:'问答',at:170/30,landing:173/30,home:573/30,box:[52,92,18,7],handY:0},
  {id:'search',label:'搜索',at:740/30,landing:743/30,home:910/30,box:[82,2.5,11,5]},
  {id:'original',label:'读完整原文',at:985/30,landing:988/30,home:1036/30,box:[62,39.5,31,4.8]},
  {id:'continue',label:'继续阅读',at:1148/30,landing:1151/30,home:1221/30,box:[5.56,66,31,5.5]},
  {id:'bilingual',label:'双语原文',at:1283/30,landing:1286/30,home:1333/30,box:[5.56,74.17,42.78,6.92]},
  {id:'diagram',label:'图解',at:1382/30,landing:1385/30,home:1456/30,box:[51.67,74.17,42.78,6.92]},
  {id:'answer',label:'智能问答',at:1487/30,landing:1490/30,home:1571/30,box:[51.67,82.36,42.78,6.92]},
  {id:'audio',label:'音频',at:1592/30,landing:1595/30,home:1732/30,box:[5.56,82.36,42.78,6.92]},
];
export const navalTimelineDuration=1797/30;
const homeIntervals=[...new Set(navalTimeline.map(scene=>scene.home))].map(start=>({start,end:navalTimeline.find(scene=>scene.at>start)?.landing??navalTimelineDuration}));
export function navalPlaybackRate(time){return homeIntervals.some(({start,end})=>time>=start&&time<end)?2:1;}
