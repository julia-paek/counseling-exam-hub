(() => {
  'use strict';
  const questions = [...document.querySelectorAll('.exam-qa')];
  if (!questions.length) return;
  const style = document.createElement('style');
  style.textContent = `.speech-tools{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 0;margin-top:16px;border-top:1px solid var(--line)}.speech-tools button,.speech-tools select,.read-question{min-height:44px;padding:10px 13px;border:1px solid var(--ink);background:var(--paper);color:var(--ink);font:inherit;cursor:pointer}.speech-tools label{display:flex;align-items:center;gap:8px}.speech-status{flex-basis:100%;font-size:14px;color:var(--muted)}.exam-qa.is-reading{outline:2px solid #b5c777;outline-offset:2px}.speech-tools button:disabled{opacity:.45;cursor:default}@media(max-width:600px){.speech-tools{display:grid;grid-template-columns:1fr 1fr}.speech-tools label,.speech-status{grid-column:1/-1}}@media print{.speech-tools,.read-question{display:none!important}}`;
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'speech-tools';
  bar.setAttribute('aria-label', '음성 읽기');
  bar.innerHTML = '<button type="button" id="speechReadAll">전체 읽기</button><button type="button" id="speechPause" disabled>일시정지</button><button type="button" id="speechStop" disabled>정지</button><label for="speechRate">읽기 속도 <select id="speechRate"><option value="0.75">0.75배속</option><option value="1" selected>1배속</option><option value="1.25">1.25배속</option><option value="1.5">1.5배속</option><option value="1.75">1.75배속</option><option value="2">2배속</option></select></label><span class="speech-status" role="status" aria-live="polite">질문 → 모범답안 → 용어 설명 → 암기 문장</span>';
  document.querySelector('.exam-guide-intro').append(bar);
  const all = bar.querySelector('#speechReadAll');
  const pause = bar.querySelector('#speechPause');
  const stop = bar.querySelector('#speechStop');
  const rate = bar.querySelector('#speechRate');
  const status = bar.querySelector('.speech-status');
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const synth = window.speechSynthesis;
  let queue = [], cursor = 0, session = 0, active = false, paused = false, currentUtterance;
  const speedKey = 'counseling-exam-speech-rate-v1';
  try { const saved = localStorage.getItem(speedKey); if ([...rate.options].some(o => o.value === saved)) rate.value = saved; } catch (_) {}
  const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  function parts(q, index) {
    const title = text(q.querySelector('.exam-question'));
    const answer = q.querySelector('.exam-answer');
    const paragraphs = [...answer.querySelectorAll(':scope > p')].map(text);
    const glossary = [...answer.querySelectorAll('.exam-glossary > div')].map(d => `${text(d.querySelector('dt'))}. ${text(d.querySelector('dd'))}`);
    return [`${index + 1}번 문제. ${title}`, '모범답안. ' + paragraphs.join(' '), ...glossary]
      .flatMap(s => s.match(/[^.!?。！？]+[.!?。！？]*/g) || [s])
      .filter(s => s.trim()).map(s => ({ text: s.trim(), index }));
  }
  function reset(message) {
    active = false; paused = false; pause.disabled = true; stop.disabled = true;
    pause.textContent = '일시정지';
    questions.forEach(q => q.classList.remove('is-reading'));
    status.textContent = message;
  }
  function cancel(message = '읽기를 정지했습니다.') {
    session++; if (supported) synth.cancel(); currentUtterance = null;
    queue = []; cursor = 0; reset(message);
  }
  function speakNext(token) {
    if (token !== session || !active) return;
    if (cursor >= queue.length) { reset('읽기를 마쳤습니다.'); return; }
    const item = queue[cursor];
    questions.forEach((q, i) => q.classList.toggle('is-reading', i === item.index));
    questions[item.index].open = true;
    status.textContent = `${item.index + 1} / ${questions.length}번 읽는 중 · ${rate.value}배속`;
    const utterance = new SpeechSynthesisUtterance(item.text);
    currentUtterance = utterance;
    utterance.lang = 'ko-KR'; utterance.rate = Number(rate.value);
    const voices = synth.getVoices();
    const korean = voices.find(v => /^ko[-_]/i.test(v.lang));
    if (korean) utterance.voice = korean;
    utterance.onend = () => { if (token === session) { cursor++; speakNext(token); } };
    utterance.onerror = event => {
      if (token !== session) return;
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      cancel('음성을 재생하지 못했습니다. 기기의 한국어 음성 설정을 확인하고 다시 눌러 주세요.');
    };
    synth.speak(utterance);
  }
  function start(items) {
    cancel(''); queue = items; active = true;
    pause.disabled = false; stop.disabled = false;
    synth.resume(); speakNext(session);
  }
  questions.forEach((q, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'read-question';
    button.textContent = '이 문항 읽기'; button.setAttribute('aria-label', `${index + 1}번 문항 읽기`);
    button.disabled = !supported;
    button.addEventListener('click', () => start(parts(q, index)));
    q.querySelector('.practice-actions').prepend(button);
  });
  if (!supported) {
    [all, pause, stop, rate].forEach(el => el.disabled = true);
    status.textContent = '이 브라우저에서는 음성 읽기를 지원하지 않습니다. Safari 또는 Chrome에서 열어 주세요.';
    return;
  }
  all.addEventListener('click', () => start(questions.flatMap(parts)));
  stop.addEventListener('click', () => cancel());
  pause.addEventListener('click', () => {
    if (!active) return;
    paused = !paused;
    if (paused) { synth.pause(); pause.textContent = '계속 읽기'; status.textContent = `${queue[cursor].index + 1}번 · 일시정지`; }
    else { synth.resume(); pause.textContent = '일시정지'; status.textContent = `${queue[cursor].index + 1} / ${questions.length}번 읽는 중 · ${rate.value}배속`; }
  });
  rate.addEventListener('change', () => {
    try { localStorage.setItem(speedKey, rate.value); } catch (_) {}
    if (active) {
      session++; synth.cancel(); paused = false; pause.textContent = '일시정지';
      synth.resume(); speakNext(session);
    }
  });
  window.addEventListener('pagehide', () => cancel());
})();
