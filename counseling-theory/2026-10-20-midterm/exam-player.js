(() => {
  'use strict';
  const originals = [...document.querySelectorAll('.exam-qa')];
  if (!originals.length) return;
  const numbers = [3,7,10,12,13,14,16,17,18,19,20,22,23,24,25,26,32,33,34];
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const synth = window.speechSynthesis;
  const text = el => (el?.textContent || '').replace(/\s+/g,' ').trim();
  const style = document.createElement('style');
  style.textContent = `body{padding-bottom:calc(var(--player-height,180px) + 28px)}.speech-tools{position:fixed;inset:auto 0 0;z-index:1000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:12px max(12px,env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--ink);background:var(--paper);box-shadow:0 -3px 14px #0000000d}.speech-tools button,.speech-tools select,.read-question,.priority-tools button{min-height:44px;padding:10px 13px;border:1px solid var(--ink);background:var(--paper);color:var(--ink);font:inherit;cursor:pointer}.speech-tools label{display:flex;align-items:center;gap:7px}.speech-status{flex-basis:100%;font-size:14px;text-align:center;color:var(--muted)}.speech-tools button:disabled,.read-question:disabled{opacity:.45;cursor:default}#speechPause{background:var(--ink);color:var(--paper)}.exam-qa.is-reading{outline:2px solid #93a74d;outline-offset:2px}.priority-section{margin-top:48px;padding-top:28px;border-top:2px solid var(--ink)}.priority-section h2{font-size:clamp(24px,4vw,34px);line-height:1.4}.priority-intro{color:var(--muted);line-height:1.7}.priority-tools{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.priority-tools button{font-size:14px}.speech-top-links{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.speech-top-links a{color:var(--ink);text-underline-offset:4px}@media(max-width:600px){.speech-tools{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:6px}.speech-tools button,.speech-tools select{font-size:14px;padding:8px}.speech-tools label{justify-content:center;font-size:13px}.speech-status{grid-column:1/-1;font-size:13px}.priority-tools{display:grid;grid-template-columns:1fr 1fr}.priority-tools button{width:100%}}@media print{body{padding-bottom:0}.speech-tools,.read-question,.speech-top-links,.priority-tools{display:none!important}}`;
  document.head.append(style);
  const audioCard = document.createElement('section');
  audioCard.className = 'priority-section'; audioCard.style.marginTop = '24px';
  audioCard.setAttribute('aria-labelledby','audioTitle');
audioCard.innerHTML = '<h2 id="audioTitle">35문항 여성 음성 · 1.2배속</h2><p class="priority-intro">질문·사례 → 모범답안 → 암기 문장 · 원문 그대로 · 용어 설명 제외 · 기본 여성 음성(Yuna)</p><audio id="examAudio" controls preload="metadata" style="width:100%" aria-label="중간고사 35문항 여성 음성파일"><source src="counseling-theory-midterm-35-female-1_2x.m4a" type="audio/mp4"></audio><div class="speech-top-links"><a href="counseling-theory-midterm-35-female-1_2x.m4a" download="상담및심리치료이론_중간고사_35문항_여성_1.2배속.m4a">여성 음성파일 다운로드 ↓</a></div>';
  document.querySelector('#midterm-answers').before(audioCard);
  const audio = audioCard.querySelector('audio');
  const section = document.createElement('section');
  section.id = 'priority-19'; section.className = 'priority-section';
  section.setAttribute('aria-labelledby','priorityTitle');
  section.innerHTML = '<h2 id="priorityTitle">교수님 강조 중심 · 우선 복습 19문항</h2><p class="priority-intro">기존 문항 번호 유지 · 03·07·10번은 수업 범위를 고려해 보완 선정</p><div class="priority-tools"><button type="button" id="priorityOpen">문제 모두 펼치기</button><button type="button" id="priorityAnswers">모범답안 모두 열기</button><button type="button" id="priorityClose">모두 접기</button><button type="button" id="priorityRead">19문항 전체 읽기</button></div><div class="priority-questions"></div>';
  document.querySelector('#midterm-answers').after(section);
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
  bar.innerHTML='<button type="button" id="speechPrev" disabled>이전 문항</button><button type="button" id="speechPause" disabled>일시정지</button><button type="button" id="speechNext" disabled>다음 문항</button><button type="button" id="speechReadAll">전체 35 읽기</button><button type="button" id="speechStop" disabled>정지</button><label for="speechRate">배속 <select id="speechRate"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.2" selected>1.2×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></label><span class="speech-status" role="status" aria-live="polite">질문 → 모범답안 → 암기 문장</span>';
  document.body.append(bar);
  const all=bar.querySelector('#speechReadAll'), pause=bar.querySelector('#speechPause'), stop=bar.querySelector('#speechStop');
  const prev=bar.querySelector('#speechPrev'), next=bar.querySelector('#speechNext'), rate=bar.querySelector('#speechRate');
  const status=bar.querySelector('.speech-status'), priorityRead=document.getElementById('priorityRead');
  const measure=() => document.documentElement.style.setProperty('--player-height',`${bar.getBoundingClientRect().height}px`);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(bar);
  window.addEventListener('resize',measure);measure();
  let queue=[],cursor=0,session=0,active=false,paused=false,currentUtterance=null;
  let readingNode=null,group=regular,groupName='전체 35문항',audioMode=false;
  const audioBaseRate=1.2;
  const speedKey='counseling-exam-speech-rate-v3';
  try {const v=localStorage.getItem(speedKey);if([...rate.options].some(o=>o.value===v))rate.value=v;}catch(_){}
  // The download already contains 1.2x audio; avoid applying that speed twice.
  audio.defaultPlaybackRate=Number(rate.value)/audioBaseRate;
  audio.playbackRate=Number(rate.value)/audioBaseRate;
  function audioControls() {
    pause.disabled=false;stop.disabled=false;prev.disabled=true;next.disabled=true;
    pause.textContent=audio.paused?'계속 읽기':'일시정지';
    const clock=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'--:--';
    status.textContent=`35문항 음성파일 · ${clock(audio.currentTime)} / ${clock(audio.duration)} · ${audio.paused?'일시정지':rate.value+'배속'}`;
  }
  function parts(entry,position) {
    const {q,number}=entry,answer=q.querySelector('.exam-answer');
    const paragraphs=[...answer.querySelectorAll(':scope > p')].map(text);
    const memory=text(answer.querySelector('.exam-glossary .memory dd'));
    const body=['모범답안. '+paragraphs.join(' '),'암기. '+memory]
      .flatMap(s=>s.match(/[^.!?。！？]+[.!?。！？]*/g)||[s]).filter(s=>s.trim());
    return [`${number}번 문제, ${text(q.querySelector('.exam-question'))} ${text(answer.querySelector('.exam-stem'))}`,...body]
      .map(s=>({text:s.trim(),entry,position}));
  }
  function controls() {
    pause.disabled=!active;stop.disabled=!active;
    const position=queue[cursor]?.position;
    prev.disabled=!active||position===0;
    next.disabled=!active||position===group.length-1;
    pause.textContent=paused?'계속 읽기':'일시정지';
  }
  function statusText() {
    const item=queue[cursor];
    return item?`${groupName} · ${item.position+1}/${group.length} · 원문 ${item.entry.number}번 · ${paused?'일시정지':rate.value+'배속 읽는 중'}`:'';
  }
  function reset(message) {
    readingNode=null;active=false;paused=false;currentUtterance=null;
    entries.forEach(({q})=>q.classList.remove('is-reading'));controls();status.textContent=message;
  }
  function cancel(message='읽기를 정지했습니다.') {
    session++;if(supported)synth.cancel();queue=[];cursor=0;reset(message);
  }
  function speakNext(token) {
    if(token!==session||!active||paused)return;
    if(cursor>=queue.length){reset('읽기를 마쳤습니다.');return;}
    const item=queue[cursor],q=item.entry.q;
    entries.forEach(e=>e.q.classList.toggle('is-reading',e.q===q));q.open=true;
    if(readingNode!==q){readingNode=q;q.style.scrollMarginTop='24px';q.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
    controls();status.textContent=statusText();
    const u=new SpeechSynthesisUtterance(item.text);currentUtterance=u;u.lang='ko-KR';u.rate=Number(rate.value);
    const koreanVoices=synth.getVoices().filter(v=>/^ko[-_]/i.test(v.lang));
    const voice=koreanVoices.find(v=>/Yuna|유나|SunHi|선희|Anna|여성/i.test(v.name))||koreanVoices[0];if(voice)u.voice=voice;
    u.onend=()=>{if(token===session){currentUtterance=null;cursor++;speakNext(token);}};
    u.onerror=e=>{if(token!==session||e.error==='interrupted'||e.error==='canceled')return;cancel('음성을 재생하지 못했습니다. 한국어 음성 설정을 확인하고 다시 눌러 주세요.');};
    synth.speak(u);
  }
  function start(list,name,position=0,single=false) {
    audioMode=false;audio.pause();cancel('');group=list;groupName=name;
    queue=single?parts(list[position],position):list.flatMap(parts).filter(item=>item.position>=position);
    active=true;synth.resume();speakNext(session);
  }
  function jump(delta) {
    if(!active||!queue[cursor])return;
    const position=queue[cursor].position+delta;
    if(position>=0&&position<group.length)start(group,groupName,position);
  }
  for(const [list,name] of [[regular,'전체 35문항'],[priority,'우선 복습 19문항']]){
    list.forEach((entry,position)=>{
      const b=document.createElement('button');b.type='button';b.className='read-question';b.textContent='이 문항 읽기';
      b.setAttribute('aria-label',`${name} ${entry.number}번 문항 읽기`);b.disabled=!supported;
      b.addEventListener('click',()=>start(list,name,position,true));entry.q.querySelector('.practice-actions').prepend(b);
    });
  }
  if(!supported){[all,prev,next,priorityRead].forEach(e=>{e.disabled=true;});status.textContent='음성파일로 들을 수 있습니다.';}
  else {
    all.addEventListener('click',()=>start(regular,'전체 35문항'));
    priorityRead.addEventListener('click',()=>start(priority,'우선 복습 19문항'));
  }
  prev.addEventListener('click',()=>jump(-1));next.addEventListener('click',()=>jump(1));
  stop.addEventListener('click',()=>{audioMode=false;audio.pause();audio.currentTime=0;cancel();});
  pause.addEventListener('click',()=>{
    if(audioMode){if(audio.paused)audio.play().catch(()=>{status.textContent='재생 버튼을 다시 눌러 주세요.';});else audio.pause();return;}
    if(!active)return;paused=!paused;
    if(paused)synth.pause();else{synth.resume();if(!currentUtterance)speakNext(session);}
    controls();status.textContent=statusText();
  });
  rate.addEventListener('change',()=>{
    try{localStorage.setItem(speedKey,rate.value);}catch(_){}
    audio.defaultPlaybackRate=Number(rate.value)/audioBaseRate;
    audio.playbackRate=Number(rate.value)/audioBaseRate;if(audioMode)audioControls();
    if(active){session++;synth.cancel();currentUtterance=null;if(!paused){synth.resume();speakNext(session);}else{controls();status.textContent=statusText();}}
  });
  audio.addEventListener('play',()=>{
    cancel('');audioMode=true;audioControls();
    if('mediaSession' in navigator && 'MediaMetadata' in window){
      navigator.mediaSession.metadata=new MediaMetadata({title:'상담및심리치료이론 중간고사 · 35문항',artist:'Yuna · 질문 · 모범답안 · 암기',album:'2026-10-20 중간고사'});
    }
  });
  audio.addEventListener('pause',()=>{if(audioMode)audioControls();});
  audio.addEventListener('timeupdate',()=>{if(audioMode)audioControls();});
  audio.addEventListener('ended',()=>{audioMode=false;reset('35문항 음성파일을 모두 들었습니다.');});
  window.addEventListener('pagehide',()=>cancel());
})();
