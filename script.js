// --- Safe DOM query helper ---
function $(id){ return document.getElementById(id); }

(function(){
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else { initApp(); }

  function initApp(){
    // Elements
    const timeDisplay = $('time-display');
    const startPauseBtn = $('start-pause-btn');
    const startPauseText = $('start-pause-text');
    const startPauseIcon = $('start-pause-icon');
    const resetBtn = $('reset-btn');
    const modeIndicator = $('mode-indicator');
    const progressRing = $('progress-ring');
    const modeButtons = document.querySelectorAll('.mode-button');

    // Tabs & sections
    const timerTab=$('timer-tab'), tasksTab=$('tasks-tab'), statsTab=$('stats-tab'), settingsTab=$('settings-tab');
    const timerContent=$('timer-content'), tasksContent=$('tasks-content'), statsContent=$('stats-content'), settingsContent=$('settings-content');

    // Settings/controls
    const notificationSound=$('notification-sound');
    const volumeSlider=$('volume-slider');
    const volumeValue=$('volume-value');

    // Tasks
    const newTaskInput=$('new-task-input');
    const tasksList=$('tasks-list');
    const tasksCompleted=$('tasks-completed');
    const tasksTotal=$('tasks-total');

    // Guards
    if(!timeDisplay||!startPauseBtn||!progressRing){ console.warn('Essential elements missing'); return; }

    // State
    let timerInterval=null, totalSeconds=25*60, remainingSeconds=25*60, isRunning=false, currentMode='Study Focus';

    // Tone.js setup with user-gesture unlock and volume mapping
    let synth=null, bgPlayer=null, unlocked=false;
    function ensureAudio(){
      try{
        if(!window.Tone) return;
        if(!unlocked){
          const resume=()=>{ Tone.start(); unlocked=true; document.removeEventListener('click',resume); document.removeEventListener('touchstart',resume); };
          document.addEventListener('click',resume,{once:true});
          document.addEventListener('touchstart',resume,{once:true});
        }
        synth = synth || new Tone.Synth().toDestination();
        setVolume(parseInt(volumeSlider?.value||'50'));
      }catch(e){ console.warn('Audio init skipped',e); }
    }
    function setVolume(percent){
      try{ if(!window.Tone) return; const db = (percent-100)/3; Tone.Destination.volume.value = db; volumeValue && (volumeValue.textContent=`${percent}%`); }catch{}
    }
    function playNotif(){ try{ ensureAudio(); synth && synth.triggerAttackRelease('C5','8n'); }catch{}
    }

    // Expose functions for inline handlers
    window.setTimer = function(seconds, modeName, clicked){
      clearInterval(timerInterval); isRunning=false; totalSeconds=seconds; remainingSeconds=seconds; currentMode=modeName; updateDisplay();
      if(modeIndicator) modeIndicator.textContent=modeName; startPauseBtn.disabled=false; resetBtn && (resetBtn.disabled=false);
      modeButtons.forEach(b=>b.classList.remove('active')); clicked && clicked.classList.add('active');
    };
    window.toggleTimer = function(){ if(isRunning) pauseTimer(); else startTimer(); };
    window.resetTimer = function(clear=true){ clearInterval(timerInterval); isRunning=false; remainingSeconds=totalSeconds; updateDisplay(); if(startPauseText) startPauseText.textContent='Start'; if(startPauseIcon) startPauseIcon.innerHTML=playIcon; if(clear&&modeIndicator){ modeIndicator.textContent='Choose a mode to begin'; startPauseBtn.disabled=true; resetBtn&&(resetBtn.disabled=true);} };

    // Icons
    const playIcon = `<path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />`;
    const pauseIcon = `<path fill-rule="evenodd" d="M5.25 4.5A.75.75 0 004.5 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2zm7.5 0A.75.75 0 0012 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2z" clip-rule="evenodd" />`;

    function startTimer(){ if(remainingSeconds<=0) return; isRunning=true; startPauseText&&(startPauseText.textContent='Pause'); startPauseIcon&&(startPauseIcon.innerHTML=pauseIcon);
      timerInterval=setInterval(()=>{ remainingSeconds--; updateDisplay(); if(remainingSeconds<=0){ completeSession(); } },1000);
    }
    function pauseTimer(){ isRunning=false; clearInterval(timerInterval); startPauseText&&(startPauseText.textContent='Resume'); startPauseIcon&&(startPauseIcon.innerHTML=playIcon); }
    function completeSession(){ playNotif(); isRunning=false; startPauseText&&(startPauseText.textContent='Start'); startPauseIcon&&(startPauseIcon.innerHTML=playIcon); remainingSeconds=totalSeconds; updateDisplay(); }

    function updateDisplay(){
      const m=Math.floor(remainingSeconds/60), s=Math.floor(remainingSeconds%60); timeDisplay.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      const progress=(totalSeconds-remainingSeconds)/totalSeconds, circ=2*Math.PI*45; progressRing.style.strokeDashoffset = (circ - progress*circ);
    }

    // Tabs
    window.showTab=function(name){
      const sets=[[timerTab,timerContent],[tasksTab,tasksContent],[statsTab,statsContent],[settingsTab,settingsContent]];
      sets.forEach(([btn,el])=>{ btn&&btn.classList.remove('active'); el&&el.classList.add('hidden'); });
      const map={timer:[timerTab,timerContent],tasks:[tasksTab,tasksContent],stats:[statsTab,statsContent],settings:[settingsTab,settingsContent]};
      const sel=map[name]; if(sel){ sel[0]&&sel[0].classList.add('active'); sel[1]&&sel[1].classList.remove('hidden'); }
    };

    // Tasks minimal implementation (no crash):
    let tasks=[]; function renderTasks(){ tasksList&&(tasksList.innerHTML=''); tasks.forEach(t=>{ const div=document.createElement('div'); div.className='task-item'; div.innerHTML=`<input type="checkbox" ${t.done?'checked':''} /> <div class="task-title ${t.done?'done':''}">${t.title}</div>`; tasksList.appendChild(div); }); tasksCompleted&&(tasksCompleted.textContent=tasks.filter(t=>t.done).length); tasksTotal&&(tasksTotal.textContent=tasks.length); }
    window.addTask = function(){ const v=(newTaskInput?.value||'').trim(); if(!v) return; tasks.push({id:Date.now(),title:v,done:false}); newTaskInput.value=''; renderTasks(); };

    // Settings listeners
    volumeSlider&&volumeSlider.addEventListener('input', e=> setVolume(parseInt(e.target.value)));
    startPauseIcon&&(startPauseIcon.innerHTML=playIcon);

    // Init
    window.showTab('timer');
    const studyBtn=$('study-btn'); studyBtn && window.setTimer(25*60,'Study Focus',studyBtn);
    ensureAudio();
    renderTasks();
  }
})();
