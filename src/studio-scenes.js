// Camera values: scale, x/y translation (% of the viewport). Replace media here.
export const studioScenes = [
  { id:'workflow', kind:'screens', label:'THE WORKSPACE', title:['把视频创作，','组织成工作流。'], description:'围绕项目推进口播、分镜与镜头制作，在同一个工作台里查看产物、提出修改并管理版本。', points:['分阶段推进','对话调整','版本留存'], duration:20,
    media:{type:'images',poster:'/media/creator-studio/workspace.webp',src:null},
    shots:[
      {at:0,src:'/media/creator-studio/workspace.webp',camera:[1,0,0],caption:'从阶段到镜头，保持同一份创作上下文。'},
      {at:4,src:'/media/creator-studio/workspace.webp',camera:[1.45,15,18],caption:'定位当前阶段，查看镜头与已有产物。'},
      {at:8,src:'/media/creator-studio/workspace.webp',camera:[1.45,-22,-8],caption:'围绕当前镜头，用自然语言提出修改。'},
      {at:13,src:'/media/creator-studio/workspace.webp',camera:[1.65,28,0],caption:'检查镜头版本与预览，保留回看的入口。'},
      {at:17,src:'/media/creator-studio/workspace.webp',camera:[1,0,0],caption:'回到全局，继续推进下一步。'},
    ] },
  {id:'architecture',kind:'architecture',label:'BEHIND THE WORKFLOW',title:['让每一步，','都有上下文与交付物。'],description:'把修改要求交给对应执行器，带上项目资料和制作规则，再把产物留在可检查、可确认的版本中。',points:['上下文组织','按阶段调用','检查与确认'],note:'工作流持续完善中，展示其任务组织方式。',duration:24,
    stages:[['口播','Reasonix'],['语音','豆包 TTS'],['分镜','Codex'],['镜头制作','Codex'],['合成','Codex'],['发布物料','Codex']],
    nodes:[['修改要求','明确目标'],['项目与阶段','组织上下文'],['执行器与工具','Codex · 制作工具'],['新版本产物','保留原版本'],['检查与确认','由创作者决定']],
    resources:['口播','分镜','当前镜头','制作规则'],
    beats:[{at:0,node:0,caption:'从完整流程，聚焦一次镜头修改。'},{at:5,node:1,caption:'带上当前项目、分镜与制作规则。'},{at:10,node:2,caption:'按制作阶段，交给对应执行器与工具。'},{at:16,node:3,caption:'修改成为新版本，原版本继续保留。'},{at:20,node:4,caption:'检查产物，由创作者确认下一步。'}] },
];
export function beatAt(beats,time){return beats.reduce((current,beat)=>time>=beat.at?beat:current,beats[0]);}
export function cameraAt(shots,time){
  const current=beatAt(shots,time), index=shots.indexOf(current), previous=shots[Math.max(0,index-1)];
  const p=Math.min(1,Math.max(0,(time-current.at)/0.55)), eased=1-Math.pow(1-p,3);
  return { ...current,camera:current.camera.map((v,i)=>previous.camera[i]+(v-previous.camera[i])*eased) };
}
