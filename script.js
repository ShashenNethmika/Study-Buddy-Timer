// --- DOM Elements ---
const timeDisplay = document.getElementById('time-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const startPauseText = document.getElementById('start-pause-text');
const startPauseIcon = document.getElementById('start-pause-icon');
const resetBtn = document.getElementById('reset-btn');
const modeIndicator = document.getElementById('mode-indicator');
const progressRing = document.getElementById('progress-ring');
const mainHeader = document.getElementById('main-header');
const modeButtons = document.querySelectorAll('.mode-button'); // Select all mode buttons
const sessionCounterDisplay = document.getElementById('session-counter');
const autoContinueToggle = document.getElementById('auto-continue-toggle');
const customColorPicker = document.getElementById('custom-color-picker'); // New DOM element
const studyTopicInput = document.getElementById('study-topic-input');
const studyTopicDisplay = document.getElementById('study-topic-display');

// New DOM Elements for new features
const timerTab = document.getElementById('timer-tab');
const tasksTab = document.getElementById('tasks-tab');
const statsTab = document.getElementById('stats-tab');
const settingsTab = document.getElementById('settings-tab');
const timerContent = document.getElementById('timer-content');
const tasksContent = document.getElementById('tasks-content');
const statsContent = document.getElementById('stats-content');
const settingsContent = document.getElementById('settings-content');
const currentTaskDisplay = document.getElementById('current-task-display');
const currentTaskText = document.getElementById('current-task-text');
const newTaskInput = document.getElementById('new-task-input');
const tasksList = document.getElementById('tasks-list');
const tasksCompleted = document.getElementById('tasks-completed');
const tasksTotal = document.getElementById('tasks-total');
const totalSessionsEl = document.getElementById('total-sessions');
const totalTimeEl = document.getElementById('total-time');
const currentStreakEl = document.getElementById('current-streak');
const completionRateEl = document.getElementById('completion-rate');
const weeklyChartCanvas = document.getElementById('weekly-chart');
const dailyGoalSlider = document.getElementById('daily-goal-slider');
const goalValue = document.getElementById('goal-value');
const goalProgress = document.getElementById('goal-progress');
const goalProgressBar = document.getElementById('goal-progress-bar');
const goalText = document.getElementById('goal-text');
const notificationSound = document.getElementById('notification-sound');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const backgroundSound = document.getElementById('background-sound');
const quoteDisplay = document.getElementById('quote-display');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');

// --- Icon SVGs ---
const playIcon = `<path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.538 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />`;
const pauseIcon = `<path fill-rule="evenodd" d="M5.25 4.5A.75.75 0 004.5 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2zm7.5 0A.75.75 0 0012 5.25v9.5c0 .414.336.75.75.75h2a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75h-2z" clip-rule="evenodd" />`;

// --- Timer State ---
let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = 25 * 60;
let isRunning = false;
let currentMode = 'Study Focus';
let sessionCount = 0;
let pomodorosUntilLongBreak = 4;

// --- Sound Synthesis ---
let synth = new Tone.Synth().toDestination();
let backgroundPlayer = null; // Tone.Player for background sounds
function setVolume(percent){
    const vol = (percent/100)*-20 + 0; // simple mapping
    Tone.Destination.volume.value = (percent-100)/3; // roughly -33dB to 0dB
}
function playNotification(){
    if (Tone.context.state !== 'running') { Tone.start(); }
    const type = notificationSound?.value || 'beep';
    if(type==='beep'){
        synth.triggerAttackRelease("C5","8n");
        synth.triggerAttackRelease("G5","8n", "+0.2");
    } else if(type==='chime'){
        synth.triggerAttackRelease("E5","8n");
        synth.triggerAttackRelease("C6","8n", "+0.15");
    } else if(type==='bell'){
        synth.triggerAttackRelease("A4","4n");
    } else if(type==='nature'){
        synth.triggerAttackRelease("D5","16n");
    }
}
function setBackgroundSound(kind){
    if(backgroundPlayer){ backgroundPlayer.stop(); backgroundPlayer.dispose(); backgroundPlayer=null; }
    if(kind==='none') return;
    const urls={
        rain:'https://cdn.pixabay.com/download/audio/2021/10/26/audio_7a1c3b.mp3?filename=light-rain-ambient-111154.mp3',
        forest:'https://cdn.pixabay.com/download/audio/2021/11/09/audio_8a5f8d.mp3?filename=forest-nature-sounds-ambient-110624.mp3',
        ocean:'https://cdn.pixabay.com/download/audio/2021/11/09/audio_6f3f2a.mp3?filename=sea-waves-ambient-110623.mp3',
        cafe:'https://cdn.pixabay.com/download/audio/2022/02/23/audio_2f3f9c.mp3?filename=coffee-shop-ambience-ambient-135038.mp3'
    };
    const url = urls[kind];
    if(!url) return;
    backgroundPlayer = new Tone.Player(url).toDestination();
    backgroundPlayer.loop = true;
    backgroundPlayer.autostart = true;
}

// --- Theming ---
const themes = {
    'forest-green': { 
        bgClass: 'bg-green-700', 
        hoverClass: 'hover:bg-green-600', 
        textColorClass: 'text-lime-400', 
        ringColorClass: 'text-lime-400',
        initialButtonColor: '#047857',
        displayTextColor: '#A3E635'
    },
    'ocean-blue': { 
        bgClass: 'bg-blue-700', 
        hoverClass: 'hover:bg-blue-600', 
        textColorClass: 'text-sky-400', 
        ringColorClass: 'text-sky-400',
        initialButtonColor: '#1d4ed8',
        displayTextColor: '#38BDF8'
    },
    'desert-sunset': { 
        bgClass: 'bg-orange-700', 
        hoverClass: 'hover:bg-orange-600', 
        textColorClass: 'text-yellow-400', 
        ringColorClass: 'text-yellow-400',
        initialButtonColor: '#c2410c',
        displayTextColor: '#FACC15'
    }
};
let currentThemeName = 'forest-green';

function applyTheme(themeName) {
    for (const key in themes) {
        const theme = themes[key];
        mainHeader.classList.remove(theme.textColorClass);
        progressRing.classList.remove(theme.ringColorClass);
        timeDisplay.classList.remove(theme.textColorClass);
        modeButtons.forEach(button => {
            button.classList.remove(theme.bgClass, theme.hoverClass);
        });
    }
    mainHeader.style.color = '';
    progressRing.style.stroke = '';
    timeDisplay.style.color = '';
    timeDisplay.style.textShadow = '';
    modeButtons.forEach(button => {
        button.style.backgroundColor = '';
        button.onmouseover = null;
        button.onmouseout = null;
    });

    let currentThemeColorForDisplay = '';

    if (themeName === 'custom') {
        currentThemeColorForDisplay = customColorPicker.value;
        mainHeader.style.color = currentThemeColorForDisplay;
        progressRing.style.stroke = currentThemeColorForDisplay;
        timeDisplay.style.color = currentThemeColorForDisplay;
        modeButtons.forEach(button => {
            button.style.backgroundColor = currentThemeColorForDisplay;
            const darkerColor = darkenColor(currentThemeColorForDisplay, 20);
            button.onmouseover = () => button.style.backgroundColor = darkerColor;
            button.onmouseout = () => button.style.backgroundColor = currentThemeColorForDisplay;
        });
        currentThemeName = 'custom';
    } else if (themes[themeName]) {
        const theme = themes[themeName];
        currentThemeColorForDisplay = theme.displayTextColor;
        mainHeader.classList.add(theme.textColorClass);
        progressRing.classList.add(theme.ringColorClass);
        timeDisplay.classList.add(theme.textColorClass);
        modeButtons.forEach(button => {
            button.classList.add(theme.bgClass, theme.hoverClass);
        });
        currentThemeName = themeName;
        customColorPicker.value = theme.initialButtonColor;
    }

    timeDisplay.style.textShadow = `
        1px 1px 2px rgba(0,0,0,0.7),
        2px 2px 4px rgba(0,0,0,0.5),
        0 0 5px ${currentThemeColorForDisplay},
        0 0 10px ${currentThemeColorForDisplay},
        0 0 20px ${currentThemeColorForDisplay}
    `;
}

function darkenColor(hex, percent) {
    let f=parseInt(hex.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=(f>>8)&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+((Math.round((t-G)*p)+G)*0x100)+((Math.round((t-B)*p)+B))).toString(16).slice(1);
}

customColorPicker?.addEventListener('input', () => {
    applyTheme('custom');
    const currentActiveButton = document.querySelector('.mode-button.active');
    if (currentActiveButton) {
        currentActiveButton.classList.add('active');
    }
});

// Tabs
function showTab(name){
    const tabs=[{btn:timerTab,content:timerContent},{btn:tasksTab,content:tasksContent},{btn:statsTab,content:statsContent},{btn:settingsTab,content:settingsContent}];
    tabs.forEach(t=>{ t.btn.classList.remove('active'); t.content.classList.add('hidden'); });
    const map={timer:{btn:timerTab,content:timerContent},tasks:{btn:tasksTab,content:tasksContent},stats:{btn:statsTab,content:statsContent},settings:{btn:settingsTab,content:settingsContent}};
    map[name].btn.classList.add('active');
    map[name].content.classList.remove('hidden');
}

// Tasks
let tasks=[]; // {id,title,done}
function saveTasks(){ localStorage.setItem('sbt_tasks', JSON.stringify(tasks)); }
function loadTasks(){ try{ tasks = JSON.parse(localStorage.getItem('sbt_tasks')||'[]'); }catch{ tasks=[]; } renderTasks(); }
function addTask(){
    const title = newTaskInput.value.trim();
    if(!title) return;
    tasks.push({id:Date.now(), title, done:false});
    newTaskInput.value='';
    saveTasks();
    renderTasks();
}
function toggleTask(id){
    const t = tasks.find(x=>x.id===id); if(!t) return; t.done=!t.done; saveTasks(); renderTasks();
}
function deleteTask(id){
    tasks = tasks.filter(x=>x.id!==id); saveTasks(); renderTasks();
}
function setCurrentTask(title){
    if(!title){ currentTaskDisplay.classList.add('hidden'); return; }
    currentTaskText.textContent = title; currentTaskDisplay.classList.remove('hidden');
}
function renderTasks(){
    tasksList.innerHTML='';
    tasks.forEach(t=>{
        const div=document.createElement('div');
        div.className='task-item';
        div.innerHTML = `
            <input type="checkbox" ${t.done?'checked':''} onchange="toggleTask(${t.id})" />
            <div class="task-title ${t.done?'done':''}">${t.title}</div>
            <div class="task-actions flex gap-2">
                <button class="text-sky-400" onclick="setCurrentTask('${t.title.replace(/'/g,"\'")}')">Focus</button>
                <button class="text-red-400" onclick="deleteTask(${t.id})">Delete</button>
            </div>`;
        tasksList.appendChild(div);
    });
    const done = tasks.filter(t=>t.done).length;
    tasksCompleted.textContent = done;
    tasksTotal.textContent = tasks.length;
}

// Stats & Persistence
let sessionCount = 0; // already exists but ensure stats use it
let totalStudySeconds = 0;
let dayStreak = 0;
let lastStudyDate = null;
let weeklyData = [0,0,0,0,0,0,0]; // Sun..Sat minutes
function saveStats(){
    const data = { sessionCount, totalStudySeconds, dayStreak, lastStudyDate, weeklyData };
    localStorage.setItem('sbt_stats', JSON.stringify(data));
}
function loadStats(){
    try{
        const data = JSON.parse(localStorage.getItem('sbt_stats')||'null');
        if(data){
            sessionCount = data.sessionCount||0;
            totalStudySeconds = data.totalStudySeconds||0;
            dayStreak = data.dayStreak||0;
            lastStudyDate = data.lastStudyDate||null;
            weeklyData = data.weeklyData||[0,0,0,0,0,0,0];
        }
    }catch{}
    updateStatsUI();
}
function updateStatsUI(){
    totalSessionsEl.textContent = sessionCount;
    const h = Math.floor(totalStudySeconds/3600), m = Math.floor((totalStudySeconds%3600)/60);
    totalTimeEl.textContent = `${h}h ${m}m`;
    currentStreakEl.textContent = dayStreak;
    const rate = sessionCount? Math.round((tasks.filter(t=>t.done).length / Math.max(tasks.length,1))*100):0;
    completionRateEl.textContent = `${rate}%`;
    drawWeeklyChart();
}
let weeklyChart = null;
function drawWeeklyChart(){
    if(!weeklyChartCanvas) return;
    if(weeklyChart){ weeklyChart.destroy(); }
    // eslint-disable-next-line no-undef
    weeklyChart = new Chart(weeklyChartCanvas, {
        type:'bar',
        data:{ labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], datasets:[{ label:'Minutes', data: weeklyData, backgroundColor:'#84cc16' }] },
        options:{ plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    });
}

// Goals
let dailyGoal = 4;
function saveGoal(){ localStorage.setItem('sbt_daily_goal', String(dailyGoal)); }
function loadGoal(){ dailyGoal = parseInt(localStorage.getItem('sbt_daily_goal')||'4'); if(dailyGoalSlider){ dailyGoalSlider.value = dailyGoal; goalValue.textContent = dailyGoal; } updateGoalProgress(); }
function updateGoalProgress(){
    if(!goalProgressBar) return;
    const sessionsToday = getTodaySessions();
    const pct = Math.min(100, Math.round((sessionsToday/dailyGoal)*100));
    goalProgressBar.style.width = pct+"%";
    goalText.textContent = `${sessionsToday} / ${dailyGoal} sessions`;
    goalProgress.classList.remove('hidden');
}
function getTodaySessions(){
    try{
        const data = JSON.parse(localStorage.getItem('sbt_day_sessions')||'{}');
        const key = new Date().toDateString();
        return data[key]||0;
    }catch{ return 0; }
}
function incrementTodaySessions(){
    const key = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('sbt_day_sessions')||'{}');
    data[key] = (data[key]||0)+1;
    localStorage.setItem('sbt_day_sessions', JSON.stringify(data));
}

// Quotes
const quotes = [
    {text:'Small progress is still progress.', author:'Unknown'},
    {text:'Focus on being productive instead of busy.', author:'Tim Ferriss'},
    {text:'The secret of getting ahead is getting started.', author:'Mark Twain'},
    {text:'It always seems impossible until it’s done.', author:'Nelson Mandela'}
];
function showRandomQuote(){
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    quoteText.textContent = `“${q.text}”`;
    quoteAuthor.textContent = `— ${q.author}`;
    quoteDisplay.classList.remove('hidden');
}

// --- Core Functions ---
function setTimer(seconds, modeName, clickedButton) {
    resetTimer(false); 
    totalSeconds = seconds;
    remainingSeconds = seconds;
    currentMode = modeName;
    updateDisplay();
    modeIndicator.textContent = modeName;
    startPauseBtn.disabled = false;
    resetBtn.disabled = false;

    if (modeName === 'Study Focus') {
        studyTopicInput.classList.remove('hidden');
        studyTopicDisplay.classList.add('hidden');
    } else {
        studyTopicInput.classList.add('hidden');
        studyTopicDisplay.classList.add('hidden');
    }

    modeButtons.forEach(button => { button.classList.remove('active'); });
    if (clickedButton) { clickedButton.classList.add('active'); }
}

function toggleTimer() { if (isRunning) pauseTimer(); else startTimer(); }

function startTimer() {
    if (remainingSeconds <= 0) return;
    isRunning = true;
    startPauseText.textContent = 'Pause';
    startPauseIcon.innerHTML = pauseIcon;

    if (currentMode === 'Study Focus') {
        const topic = studyTopicInput.value.trim();
        if (topic) {
            studyTopicDisplay.textContent = `Studying: ${topic}`;
            studyTopicDisplay.classList.remove('hidden');
            studyTopicInput.classList.add('hidden');
        } else {
            studyTopicInput.classList.add('hidden');
            studyTopicDisplay.classList.add('hidden');
        }
    }

    timerInterval = setInterval(() => {
        remainingSeconds--;
        totalStudySeconds++;
        updateDisplay();
        if (remainingSeconds <= 0) {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startPauseText.textContent = 'Resume';
    startPauseIcon.innerHTML = playIcon;
}

function resetTimer(clearMode = true) {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = totalSeconds;
    updateDisplay();
    startPauseText.textContent = 'Start';
    startPauseIcon.innerHTML = playIcon;

    studyTopicInput.classList.add('hidden');
    studyTopicDisplay.classList.add('hidden');
    studyTopicInput.value = '';

    if (clearMode) {
        modeIndicator.textContent = 'Choose a mode to begin';
        startPauseBtn.disabled = true;
        resetBtn.disabled = true;
        updateSessionCounter();
        modeButtons.forEach(button => { button.classList.remove('active'); });
    }
}

function updateSessionCounter() {
    sessionCounterDisplay.textContent = `Sessions: ${sessionCount}`;
}

function completeSession() {
    playNotification();
    let wasStudySession = currentMode === 'Study Focus';
    if (wasStudySession) {
        sessionCount++;
        incrementTodaySessions();
        updateGoalProgress();

        const today = new Date().toDateString();
        if(lastStudyDate !== today){
            if(lastStudyDate && (new Date(today) - new Date(lastStudyDate) === 86400000)){
                dayStreak++;
            } else if(!lastStudyDate){
                dayStreak = 1;
            } else {
                dayStreak = 1;
            }
            lastStudyDate = today;
        }
        const day = new Date().getDay();
        weeklyData[day] += Math.round(totalSeconds/60);
        showRandomQuote();
        updateStatsUI();
        saveStats();
    }

    if (autoContinueToggle.checked) {
        if (wasStudySession) {
            if (sessionCount > 0 && sessionCount % pomodorosUntilLongBreak === 0) {
                setTimer(getCustomLong()*60, 'Long Break', document.getElementById('long-break-btn'));
            } else {
                setTimer(getCustomShort()*60, 'Short Break', document.getElementById('short-break-btn'));
            }
        } else {
            setTimer(getCustomStudy()*60, 'Study Focus', document.getElementById('study-btn'));
        }
        startTimer();
    } else {
        isRunning = false;
        startPauseText.textContent = 'Start';
        startPauseIcon.innerHTML = playIcon;
        remainingSeconds = totalSeconds;
        updateDisplay();
        modeButtons.forEach(button => { button.classList.remove('active'); });
    }
}

function updateDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const displayString = `${String(minutes).padStart(2, '0')}:${String(Math.floor(remainingSeconds % 60)).padStart(2, '0')}`;
    timeDisplay.textContent = displayString;
    document.title = `${displayString} - ${currentMode}`;

    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - progress * circumference;
    progressRing.style.strokeDashoffset = offset;
}

// Custom Durations
function getCustomStudy(){ return parseInt(document.getElementById('custom-study')?.value||'25'); }
function getCustomShort(){ return parseInt(document.getElementById('custom-short')?.value||'5'); }
function getCustomLong(){ return parseInt(document.getElementById('custom-long')?.value||'15'); }

// Settings events
dailyGoalSlider?.addEventListener('input', e=>{ dailyGoal = parseInt(e.target.value); goalValue.textContent = dailyGoal; updateGoalProgress(); saveGoal(); });
notificationSound?.addEventListener('change', ()=>{});
volumeSlider?.addEventListener('input', e=>{ volumeValue.textContent = `${e.target.value}%`; setVolume(parseInt(e.target.value)); });
backgroundSound?.addEventListener('change', e=> setBackgroundSound(e.target.value));

function resetAllData(){
    localStorage.removeItem('sbt_tasks');
    localStorage.removeItem('sbt_stats');
    localStorage.removeItem('sbt_day_sessions');
    localStorage.removeItem('sbt_daily_goal');
    tasks=[]; renderTasks();
    sessionCount=0; totalStudySeconds=0; dayStreak=0; lastStudyDate=null; weeklyData=[0,0,0,0,0,0,0]; saveStats(); updateStatsUI();
    updateGoalProgress();
}

// --- Initial Setup ---
window.onload = () => {
    setTimer(25 * 60, 'Study Focus', document.getElementById('study-btn'));
    startPauseIcon.innerHTML = playIcon;
    loadTasks();
    loadStats();
    loadGoal();
    applyTheme(currentThemeName);
    showTab('timer');
};
