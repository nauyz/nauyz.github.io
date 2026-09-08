import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const ff=args=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args]);
const parts=[['public/media/naval/demo.mp4',5.3,7,false],['qa/naval/diagram-raw.mp4',0,7,true],['qa/naval/audio-raw.mp4',0,7,true],['public/media/naval/demo.mp4',11.5,3,false],['public/media/naval/demo.mp4',18.5,2,false],['public/media/naval/demo.mp4',21.5,2,false]];
for(let i=0;i<parts.length;i++){
  const [src,start,duration,crop]=parts[i];
  // Keep the reading segment on its page: the last two seconds hold its bilingual view.
  const end=i===0?10.3:start+duration;
  ff(['-i',src,'-map','0:v:0','-an','-vf',`${crop?'crop=1080:2342:0:130,':''}fps=30:start_time=0,trim=start=${start}:end=${end},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=3`,'-frames:v',String(duration*30),'-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p',`qa/naval/feature-${i}.mp4`]);
}
fs.writeFileSync('qa/naval/feature-concat.txt',parts.map((_,i)=>`file 'feature-${i}.mp4'`).join('\n'));
ff(['-f','concat','-safe','0','-i','qa/naval/feature-concat.txt','-c','copy','-movflags','+faststart','public/media/naval/features.mp4']);
ff(['-ss','0.5','-i','public/media/naval/features.mp4','-frames:v','1','-quality','92','public/media/naval/reading.webp']);
for(const [name,time] of [['reading',3],['diagram',11],['audio',18],['answer',23],['sources',25],['cited',27]])ff(['-ss',String(time),'-i','public/media/naval/features.mp4','-frames:v','1',`qa/naval/feature-${name}.png`]);
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','public/media/naval/features.mp4'],{encoding:'utf8'}));
if(probe.streams.length!==1||probe.streams[0].nb_frames!=='840'||+probe.format.duration!==28)throw Error('Invalid reel');
fs.writeFileSync('qa/naval/features-verification.json',JSON.stringify(probe,null,2));console.log({duration:probe.format.duration,size:probe.format.size});
