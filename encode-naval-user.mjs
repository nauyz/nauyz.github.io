import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {navalScenes,navalDuration} from './src/naval-scenes.js';
const source='个人网站视频素材/纳瓦尔app处理后.mp4';
const ff=args=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args]);
fs.mkdirSync('qa/naval/user-edit',{recursive:true});
for(const scene of navalScenes){
  const filters=scene.clips.map(([start,end],i)=>`[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS,crop=720:1562:0:86,fps=30,setsar=1[p${i}]`);
  const inputs=scene.clips.map((_,i)=>`[p${i}]`).join('');
  filters.push(`${inputs}concat=n=${scene.clips.length}:v=1:a=0,tpad=stop_mode=clone:stop_duration=4,fps=30,trim=end_frame=${scene.duration*30},setpts=N/(30*TB)[out]`);
  ff(['-i',source,'-filter_complex',filters.join(';'),'-map','[out]','-an','-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p',`qa/naval/user-edit/${scene.id}.mp4`]);
  ff(['-ss','0.5','-i',`qa/naval/user-edit/${scene.id}.mp4`,'-frames:v','1',`qa/naval/user-edit/${scene.id}.png`]);
}
fs.writeFileSync('qa/naval/user-edit/concat.txt',navalScenes.map(s=>`file '${s.id}.mp4'`).join('\n'));
ff(['-f','concat','-safe','0','-i','qa/naval/user-edit/concat.txt','-c','copy','-movflags','+faststart','public/media/naval/user-features.mp4']);
ff(['-ss','0.5','-i','public/media/naval/user-features.mp4','-frames:v','1','-quality','92','public/media/naval/user-poster.webp']);
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','public/media/naval/user-features.mp4'],{encoding:'utf8'}));
if(probe.streams.length!==1||Math.abs(+probe.format.duration-navalDuration)>.05)throw Error('Unexpected media duration or audio');
fs.writeFileSync('qa/naval/user-edit/manifest.json',JSON.stringify({source,crop:'720:1562:0:86',scenes:navalScenes,probe},null,2));
console.log({duration:probe.format.duration,bytes:probe.format.size,scenes:navalScenes.length});
