import {useEffect,useState} from 'react';

export default function useStudioVideoSource(media,architecture){
  const [mobile]=useState(()=>!architecture&&!!media.mobileSrc&&matchMedia('(max-width: 768px), (pointer: coarse)').matches);
  const [source,setSource]=useState(mobile?null:media.src);
  const [loadError,setLoadError]=useState(false);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    if(!mobile)return;
    const controller=new AbortController();let objectUrl;
    setLoadError(false);setSource(null);
    (async()=>{
      try{
        const response=await fetch(media.mobileSrc,{signal:controller.signal});
        if(!response.ok)throw new Error(`Video download: ${response.status}`);
        const blob=await response.blob();
        if(controller.signal.aborted)return;
        objectUrl=URL.createObjectURL(blob);setSource(objectUrl);
      }catch(error){if(!controller.signal.aborted)setLoadError(true);}
    })();
    return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[mobile,media.mobileSrc,attempt]);
  return {source,loading:mobile&&!source&&!loadError,loadError,retry:()=>setAttempt(n=>n+1),
    useCachedFile:()=>setSource(media.mobileSrc)};
}
