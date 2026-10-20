(() => {
  'use strict';
  const originals = [...document.querySelectorAll('.exam-qa')];
  if (!originals.length) return;
  const numbers = [3,7,10,12,13,14,16,17,18,19,20,22,23,24,25,26,32,33,34];
  const text = el => (el?.textContent || '').replace(/\s+/g,' ').trim();
  const style = document.createElement('style');
  style.textContent = `body{padding-bottom:calc(var(--player-height,180px) + 28px)}.speech-tools{position:fixed;inset:auto 0 0;z-index:1000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:12px max(12px,env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--ink);background:var(--paper);box-shadow:0 -3px 14px #0000000d}.speech-tools button,.speech-tools select,.read-question,.priority-tools button{min-height:44px;padding:10px 13px;border:1px solid var(--ink);background:var(--paper);color:var(--ink);font:inherit;cursor:pointer}.speech-tools label{display:flex;align-items:center;gap:7px}.speech-status{flex-basis:100%;font-size:14px;text-align:center;color:var(--muted)}.speech-tools button:disabled,.read-question:disabled{opacity:.45;cursor:default}#speechPause{background:var(--ink);color:var(--paper)}.exam-qa.is-reading{outline:2px solid #93a74d;outline-offset:2px}.priority-section{margin-top:48px;padding-top:28px;border-top:2px solid var(--ink)}.priority-section h2{font-size:clamp(24px,4vw,34px);line-height:1.4}.priority-intro{color:var(--muted);line-height:1.7}.priority-tools{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.priority-tools button{font-size:14px}.speech-top-links{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.speech-top-links a{color:var(--ink);text-underline-offset:4px}@media(max-width:600px){.speech-tools{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:6px}.speech-tools button,.speech-tools select{font-size:14px;padding:8px}.speech-tools label{justify-content:center;font-size:13px}.speech-status{grid-column:1/-1;font-size:13px}.priority-tools{display:grid;grid-template-columns:1fr 1fr}.priority-tools button{width:100%}}@media print{body{padding-bottom:0}.speech-tools,.read-question,.speech-top-links,.priority-tools{display:none!important}}`;
  document.head.append(style);
  const audioCard = document.createElement('section');
  audioCard.className = 'priority-section'; audioCard.style.marginTop = '24px';
  audioCard.setAttribute('aria-labelledby','audioTitle');
  audioCard.innerHTML = '<h2 id="audioTitle">음성듣기 · 전체 35문항</h2><p class="priority-intro">질문 → 답안 → 암기 · 잡음 억제 · 원본 속도</p><audio id="examAudio" controls preload="metadata" style="width:100%" aria-label="내 목소리 전체 35문항"><source src="counseling-midterm-own-35.m4a" type="audio/mp4"></audio><div class="speech-top-links"><a href="counseling-midterm-own-35.m4a" download="상담및심리치료이론_중간고사_내목소리_35문항_원본속도.m4a">35문항 음성파일 다운로드 ↓</a></div>';
  document.querySelector('#midterm-answers').before(audioCard);
  const audio = audioCard.querySelector('audio');
  const section = document.createElement('section');
  section.id = 'priority-19'; section.className = 'priority-section';
  section.setAttribute('aria-labelledby','priorityTitle');
  section.innerHTML = '<h2 id="priorityTitle">교수님 강조 중심 · 우선 복습 19문항</h2><p class="priority-intro">기존 문항 번호 유지 · 03·07·10번은 수업 범위를 고려해 보완 선정</p><div class="priority-tools"><button type="button" id="priorityOpen">문제 모두 펼치기</button><button type="button" id="priorityAnswers">모범답안 모두 열기</button><button type="button" id="priorityClose">모두 접기</button><button type="button" id="priorityRead">19문항 전체 듣기</button></div><div class="priority-questions"></div>';
  document.querySelector('#midterm-answers').after(section);
  const priorityAudioCard = document.createElement('div');
  priorityAudioCard.innerHTML = '<p class="priority-intro">내 목소리 · 핵심 19문항 연속 듣기 · 원본 속도</p><audio id="priorityAudio" controls preload="metadata" style="width:100%" aria-label="내 목소리 핵심 19문항"><source src="counseling-midterm-own-19.m4a" type="audio/mp4"></audio><div class="speech-top-links"><a href="counseling-midterm-own-19.m4a" download="상담및심리치료이론_중간고사_내목소리_핵심19문항_원본속도.m4a">핵심 19문항 음성파일 다운로드 ↓</a></div>';
  section.querySelector('.priority-tools').before(priorityAudioCard);
  const priorityAudio = priorityAudioCard.querySelector('audio');
  function showAnswer(q, visible) {
    q.querySelector('.exam-answer').classList.toggle('practice-visible',visible);
    q.querySelector('.exam-answer').classList.toggle('practice-hidden',!visible);
    const b = q.querySelector('.show-answer');
    b.textContent = visible ? '모범답안 숨기기' : '모범답안 보기';
    b.setAttribute('aria-expanded',String(visible));
  }
  const priority = numbers.map(number => {
    const source = originals[number-1], clone = source.cloneNode(true);
    clone.id = `priority-question-${number}`; clone.open = false;
    clone.classList.remove('is-reading'); showAnswer(clone,false);
    const area = clone.querySelector('textarea'), originalArea = source.querySelector('textarea');
    area.id = `priority-answer-${number}`;
    clone.querySelector('label').htmlFor = area.id;
    area.setAttribute('aria-label',`우선 복습 ${number}번 내 답안 입력`);
    area.value = originalArea.value;
    const saved = clone.querySelector('.saved-indicator');
    area.addEventListener('input',() => {
      originalArea.value = area.value;
      originalArea.dispatchEvent(new Event('input',{bubbles:true}));
      saved.textContent = '저장됨';
    });
    originalArea.addEventListener('input',() => { area.value = originalArea.value; });
    clone.querySelector('.show-answer').addEventListener('click',() => showAnswer(clone,!clone.querySelector('.exam-answer').classList.contains('practice-visible')));
    const clear = [...clone.querySelectorAll('.practice-actions button')].find(b => b.textContent === '이 답안 지우기');
    const originalClear = [...source.querySelectorAll('.practice-actions button')].find(b => b.textContent === '이 답안 지우기');
    originalClear.addEventListener('click',() => {area.value=originalArea.value;saved.textContent='';});
    clear.addEventListener('click',() => {
      originalClear.click();
      area.value = ''; saved.textContent = '지워짐'; area.focus();
    });
    section.querySelector('.priority-questions').append(clone);
    return {q:clone,number};
  });
  // The originals own saved answers, so copies never create a second set of drafts.
  document.getElementById('examClearDrafts').addEventListener('click',() => {
    priority.forEach(({q,number}) => { q.querySelector('textarea').value = originals[number-1].querySelector('textarea').value; });
  });
  const regular = originals.map((q,i) => ({q,number:i+1}));
  const entries = [...regular,...priority];
  document.getElementById('priorityOpen').addEventListener('click',() => priority.forEach(({q}) => {q.open=true;}));
  document.getElementById('priorityAnswers').addEventListener('click',() => priority.forEach(({q}) => {q.open=true;showAnswer(q,true);}));
  document.getElementById('priorityClose').addEventListener('click',() => priority.forEach(({q}) => {q.open=false;showAnswer(q,false);}));
  const links = document.createElement('div'); links.className='speech-top-links';
  links.innerHTML='<a href="#priority-19">우선 복습 19문항으로 이동 ↓</a>';
  document.querySelector('.exam-guide-intro').append(links);
  const bar = document.createElement('div'); bar.className='speech-tools';
  bar.setAttribute('aria-label','고정 음성 재생바');
  bar.innerHTML='<button type="button" id="speechPrev" disabled>이전 문항</button><button type="button" id="speechPause" disabled>일시정지</button><button type="button" id="speechNext" disabled>다음 문항</button><button type="button" id="speechReadAll">전체 35 듣기</button><button type="button" id="speechStop" disabled>정지</button><label for="speechRate">배속 <select id="speechRate"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></label><span class="speech-status" role="status" aria-live="polite">질문 → 모범답안 → 암기 문장</span>';
  document.body.append(bar);
  const all=bar.querySelector('#speechReadAll'), pause=bar.querySelector('#speechPause'), stop=bar.querySelector('#speechStop');
  const prev=bar.querySelector('#speechPrev'), next=bar.querySelector('#speechNext'), rate=bar.querySelector('#speechRate');
  const status=bar.querySelector('.speech-status'), priorityRead=document.getElementById('priorityRead');
  const measure=() => document.documentElement.style.setProperty('--player-height',`${bar.getBoundingClientRect().height}px`);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(bar);
  window.addEventListener('resize',measure);measure();

  // Refresh both playback and downloads when the mastered audio changes.
  for(const card of [audioCard,priorityAudioCard]){
    for(const el of card.querySelectorAll('source,a[download]')){
      const key=el.tagName==='SOURCE'?'src':'href';
      el.setAttribute(key,el.getAttribute(key)+'?v=source-faithful-20261020-v5');
    }
    card.querySelector('audio').load();
  }
  const recording=window.EXAM_RECORDING;
  if(!recording || recording.full.questions.length!==35 || recording.priority.questions.length!==19){
    [all,pause,stop,prev,next,priorityRead].forEach(b=>b.disabled=true);
    status.textContent='녹음 정보를 불러오지 못했습니다. 새로고침해 주세요.';
    return;
  }
  if(recording.aiQuestions?.length){
    for(const card of [audioCard,priorityAudioCard]){
      const note=document.createElement('p');note.className='priority-intro';
      const included=recording.aiQuestions.filter(n=>(card===audioCard?recording.full:recording.priority).questions.some(q=>q.number===n));
      note.textContent=included.join('·')+'번은 수정 답안의 여성 AI 음성 · 나머지는 본인 녹음';
      card.querySelector('audio').before(note);
    }
  }
  const full={audio,entries:regular,map:recording.full.questions,name:'전체 35문항'};
  const focus={audio:priorityAudio,entries:priority,map:recording.priority.questions,name:'핵심 19문항'};
  const lists=[full,focus],speedKey='counseling-exam-own-voice-rate-v2';
  let current=full,index=-1,single=false,completed=false,lastNode=null,stage='';
  try {const saved=localStorage.getItem(speedKey);if([...rate.options].some(o=>o.value===saved))rate.value=saved;}catch(_){}
  function setRate(){
    for(const list of lists){
      list.audio.defaultPlaybackRate=Number(rate.value)/recording.bakedRate;
      list.audio.playbackRate=Number(rate.value)/recording.bakedRate;
      list.audio.preservesPitch=true;
    }
  }
  setRate();
  const highlightStyle=document.createElement('style');
  highlightStyle.textContent='.is-reading-part{background:#fff0ac!important;box-shadow:0 0 0 3px #fff0ac}.is-reading .exam-qno{background:#dbe6aa}.speech-tools button:focus-visible,.read-question:focus-visible{outline:3px solid #93a74d;outline-offset:2px}';
  document.head.append(highlightStyle);
  function clearHighlights(){
    entries.forEach(({q})=>{q.classList.remove('is-reading');q.querySelectorAll('.is-reading-part').forEach(e=>e.classList.remove('is-reading-part'));});
  }
  function position(time){
    const found=current.map.findIndex(s=>time>=s.start-0.02 && time<s.end-0.005);
    return found<0?(time>=current.map.at(-1).end?current.map.length-1:0):found;
  }
  function controls(){
    const has=index>=0;
    prev.disabled=!has || index===0;
    next.disabled=!has || index===current.entries.length-1;
    pause.disabled=!has;
    stop.disabled=!has;
    pause.textContent=completed?'다시 듣기':current.audio.paused?'계속 듣기':'일시정지';
  }
  function showCurrent(force=false){
    if(index<0)return;
    const entry=current.entries[index],q=entry.q,segment=current.map[index];
    const t=current.audio.currentTime;
    stage=t>=segment.memory?'암기':t>=segment.answer?'답안':'질문';
    clearHighlights();q.classList.add('is-reading');q.open=true;showAnswer(q,true);
    const targets=stage==='질문'?[q.querySelector('.exam-question')]:stage==='답안'?[...q.querySelectorAll('.exam-answer > p')]:[q.querySelector('.memory dd')];
    targets.filter(Boolean).forEach(el=>el.classList.add('is-reading-part'));
    if(lastNode!==q || force){
      lastNode=q;q.style.scrollMarginTop='24px';
      q.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    }
    status.textContent=completed?`${entry.number}번 문항을 모두 들었습니다.`:`${current.name} · ${index+1}/${current.entries.length} · 원문 ${entry.number}번 · ${stage} · ${current.audio.paused?'일시정지':rate.value+'배속'}`;
    controls();
    if('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && Number.isFinite(current.audio.duration)){
      try{navigator.mediaSession.setPositionState({duration:current.audio.duration,playbackRate:current.audio.playbackRate,position:Math.min(current.audio.duration,current.audio.currentTime)});}catch(_){}
    }
  }
  function metadata(){
    if('mediaSession' in navigator && 'MediaMetadata' in window){
      navigator.mediaSession.metadata=new MediaMetadata({title:`상담및심리치료이론 중간고사 · ${current.name}`,artist:'Julia · 내 목소리',album:'2026-10-20 중간고사'});
    }
  }
  function start(list,at=0,one=false){
    lists.forEach(l=>l.audio.pause());
    current=list;index=at;single=one;completed=false;lastNode=null;
    const seek=()=>{list.audio.currentTime=list.map[at].start;showCurrent(true);};
    if(list.audio.readyState>=1)seek();else list.audio.addEventListener('loadedmetadata',seek,{once:true});
    metadata();
    list.audio.play().catch(()=>{status.textContent='재생 버튼을 다시 눌러 주세요.';controls();});
    controls();
  }
  function jump(delta){
    if(index<0)return;
    const at=index+delta;if(at>=0 && at<current.entries.length)start(current,at,single);
  }
  function stopPlayback(){
    lists.forEach(l=>{l.audio.pause();l.audio.currentTime=0;});
    index=-1;completed=false;single=false;lastNode=null;clearHighlights();controls();
    status.textContent='재생을 정지했습니다.';
  }
  for(const list of lists){
    list.entries.forEach((entry,at)=>{
      const b=document.createElement('button');b.type='button';b.className='read-question';b.textContent='이 문항 듣기';
      b.setAttribute('aria-label',`${list.name} ${entry.number}번 내 녹음 듣기`);
      b.addEventListener('click',()=>start(list,at,true));
      entry.q.querySelector('.practice-actions').prepend(b);
    });
    list.audio.addEventListener('play',()=>{
      // A queued play event may arrive after the user has already paused/seeks.
      if(list.audio.paused)return;
      if(current!==list){
        current.audio.pause();current=list;single=false;completed=false;lastNode=null;index=position(list.audio.currentTime);
      }else if(index<0){single=false;index=position(list.audio.currentTime);}
      else if(completed){completed=false;list.audio.currentTime=list.map[index].start;}
      lists.filter(l=>l!==list).forEach(l=>l.audio.pause());
      metadata();showCurrent();
    });
    list.audio.addEventListener('pause',()=>{if(current===list && index>=0)showCurrent();});
    list.audio.addEventListener('timeupdate',()=>{
      if(current!==list || index<0 || completed)return;
      if(single && list.audio.currentTime>=list.map[index].end-0.035){
        completed=true;list.audio.pause();showCurrent();return;
      }
      if(!single)index=position(list.audio.currentTime);
      showCurrent();
    });
    list.audio.addEventListener('seeked',()=>{
      if(current===list && index>=0 && !single){index=position(list.audio.currentTime);showCurrent();}
    });
    list.audio.addEventListener('ended',()=>{
      if(current===list){completed=true;showCurrent();status.textContent=`${list.name}을 모두 들었습니다.`;}
    });
  }
  all.addEventListener('click',()=>start(full));
  priorityRead.addEventListener('click',()=>start(focus));
  prev.addEventListener('click',()=>jump(-1));next.addEventListener('click',()=>jump(1));
  stop.addEventListener('click',stopPlayback);
  pause.addEventListener('click',()=>{
    if(index<0)return;
    if(completed){start(current,index,single);return;}
    if(current.audio.paused)current.audio.play().catch(()=>{status.textContent='재생 버튼을 다시 눌러 주세요.';});
    else current.audio.pause();
  });
  rate.addEventListener('change',()=>{
    try{localStorage.setItem(speedKey,rate.value);}catch(_){}
    setRate();if(index>=0)showCurrent();
  });
  if('mediaSession' in navigator){
    const actions={play:()=>{if(index>=0)current.audio.play().catch(()=>{});},pause:()=>current.audio.pause(),stop:stopPlayback,previoustrack:()=>jump(-1),nexttrack:()=>jump(1),seekbackward:d=>{current.audio.currentTime=Math.max(0,current.audio.currentTime-(d.seekOffset||10));},seekforward:d=>{current.audio.currentTime=Math.min(current.audio.duration||0,current.audio.currentTime+(d.seekOffset||10));},seekto:d=>{if(Number.isFinite(d.seekTime))current.audio.currentTime=d.seekTime;}};
    for(const [action,handler] of Object.entries(actions)){try{navigator.mediaSession.setActionHandler(action,handler);}catch(_){}}
  }
  window.addEventListener('pagehide',()=>lists.forEach(l=>l.audio.pause()));
  controls();status.textContent='내 목소리 · 질문 → 답안 → 암기';
})();
