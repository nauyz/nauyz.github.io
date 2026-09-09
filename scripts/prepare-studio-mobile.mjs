import {execFileSync} from 'node:child_process';
import {existsSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const input=fileURLToPath(new URL('../public/media/creator-studio/demo.mp4',import.meta.url));
const output=fileURLToPath(new URL('../public/media/creator-studio/mobile.mp4',import.meta.url));
if(!existsSync(output)||statSync(output).mtimeMs<Math.max(statSync(input).mtimeMs,statSync(fileURLToPath(import.meta.url)).mtimeMs)){
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',input,'-map','0:v:0','-vf','scale=1440:-2','-c:v','libx264','-preset','fast','-crf','25','-profile:v','baseline','-pix_fmt','yuv420p','-g','30','-keyint_min','30','-sc_threshold','0','-an','-movflags','+faststart',output,'-y'],{stdio:'inherit'});
}
