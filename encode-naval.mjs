import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const run = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const out = 'public/media/naval/';
// Android records sparse variable-rate frames. Expand holds BEFORE trimming;
// input seeking would discard the homepage frame that spans the in-point.
run(['-i', 'qa/naval/raw.mp4', '-an', '-vf', 'crop=1080:2342:0:130,fps=30:start_time=0,trim=start=1:duration=28,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=4', '-frames:v', '840', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out + 'demo.mp4']);
run(['-i', 'qa/naval/home-final.png', '-vf', 'crop=1080:2342:0:130', '-quality', '93', out + 'poster.webp']);
const spec = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', out + 'demo.mp4'], { encoding: 'utf8' }));
const stream = spec.streams[0];
if (spec.streams.length !== 1 || stream.codec_name !== 'h264' || stream.width !== 1080 || stream.height !== 2342 || stream.nb_frames !== '840' || Number(spec.format.duration) !== 28) throw Error('Unexpected video specification');
fs.writeFileSync('qa/naval/media-verification.json', JSON.stringify(spec, null, 2));
for (const [name, time] of [['first', 0], ['read', 6.5], ['bilingual', 9.5], ['answer', 15], ['sources', 20], ['source-reader', 23], ['last', 27]]) run(['-ss', String(time), '-i', out + 'demo.mp4', '-frames:v', '1', `qa/naval/${name}.png`]);
run(['-i', out + 'demo.mp4', '-vf', 'fps=1/4,scale=270:-1,tile=7x1', '-frames:v', '1', 'qa/naval/contact-sheet.jpg']);
console.log(JSON.stringify({ duration: spec.format.duration, size: spec.format.size, frames: stream.nb_frames }));
