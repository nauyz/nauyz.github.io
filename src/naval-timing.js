export const navalTiming={rest:.35,flashEnd:1.05,tapEnd:1.45,reactionEnd:2.05,transferEnd:2.7,end:3};
export function navalCuePhase(time){
  if(time==null)return 'demo';
  const t=navalTiming;
  if(time<t.rest)return 'rest';
  if(time<t.flashEnd)return 'flash';
  if(time<t.tapEnd)return 'tap';
  if(time<t.reactionEnd)return 'reaction';
  if(time<t.transferEnd)return 'transfer';
  return 'settle';
}
