// Source times refer to the user's 59.907 s phone recording. Crop removes system bars.
export const navalScenes = [
  {id:'catalog',label:'目录问答',duration:9,clips:[[2.2,5.5],[12,17.7]],box:[29,92,18,7],handY:0},
  {id:'original',label:'读完整原文',duration:4,clips:[[38,40.3]],box:[62,39.5,31,4.8]},
  {id:'search',label:'搜索',duration:4,clips:[[26,30]],box:[82,2.5,11,5]},
  {id:'continue',label:'继续阅读',duration:4,clips:[[33,34.3]],box:[5.56,66,31,5.5]},
  {id:'bilingual',label:'双语原文',duration:3.5,clips:[[43,44.1]],box:[5.56,74.17,42.78,6.92]},
  {id:'diagram',label:'图解',duration:3.5,clips:[[46.2,48.2]],box:[51.67,74.17,42.78,6.92]},
  {id:'answer',label:'智能问答',duration:4,clips:[[49.5,51.3]],box:[51.67,82.36,42.78,6.92]},
  {id:'audio',label:'音频',duration:4,clips:[[53,57]],box:[5.56,82.36,42.78,6.92]},
];
let offset=0;
for(const scene of navalScenes){scene.start=offset;offset+=scene.duration;scene.end=offset;}
export const navalDuration=offset;
export function navalSceneIndex(time){const index=navalScenes.findIndex(scene=>time<scene.end);return index<0?navalScenes.length-1:index;}
