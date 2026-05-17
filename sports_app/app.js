document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let currentUser = null;
    let userBio = null;
    let timerInterval = null;
    let timeRemaining = 0; // dalam detik
    
    // --- DOM Elements ---
    const views = document.querySelectorAll('.view');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const identitasForm = document.getElementById('identitas-form');
    const userDisplay = document.getElementById('user-display');
    const profileStatus = document.getElementById('profile-status');
    const rekomendasiList = document.getElementById('rekomendasi-list');
    const aiTimerRecommendation = document.getElementById('ai-timer-recommendation');
    const timerDisplay = document.getElementById('timer-display');
    
    // Buttons
    const btnLogout = document.getElementById('btn-logout');
    const backBtns = document.querySelectorAll('.back-btn');
    const btnRekomendasi = document.getElementById('btn-rekomendasi');
    const btnMisi = document.getElementById('btn-misi');
    const btnTimer = document.getElementById('btn-timer');
    const btnStartTimer = document.getElementById('btn-start-timer');
    const btnPauseTimer = document.getElementById('btn-pause-timer');
    const btnResetTimer = document.getElementById('btn-reset-timer');

    // --- Navigation Logic ---
    function navigateTo(viewId) {
        views.forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            navigateTo(target);
        });
    });

    btnRekomendasi.addEventListener('click', () => navigateTo('view-rekomendasi'));
    btnMisi.addEventListener('click', () => navigateTo('view-misi'));
    btnTimer.addEventListener('click', () => {
        setupTimer();
        navigateTo('view-timer');
    });

    // --- Auth Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = usernameInput.value;
        userDisplay.textContent = currentUser;
        
        // Cek apakah ada bio tersimpan
        const savedBio = localStorage.getItem(`bio_${currentUser}`);
        if (savedBio) {
            userBio = JSON.parse(savedBio);
            updateDashboard();
            navigateTo('view-dashboard');
        } else {
            navigateTo('view-identitas');
        }
    });

    btnLogout.addEventListener('click', () => {
        currentUser = null;
        userBio = null;
        stopTimer();
        loginForm.reset();
        navigateTo('view-login');
    });

    // --- Form Identitas Logic ---
    identitasForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        userBio = {
            age: parseInt(document.getElementById('age').value),
            weight: parseInt(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            disability: document.getElementById('disability').value
        };

        // Simpan ke local storage
        localStorage.setItem(`bio_${currentUser}`, JSON.stringify(userBio));
        
        updateDashboard();
        navigateTo('view-dashboard');
    });

    // --- AI Logic Simulation ---
    function updateDashboard() {
        if (!userBio) return;

        // BMI Calculation
        const heightM = userBio.height / 100;
        const bmi = userBio.weight / (heightM * heightM);
        let statusKesehatan = "Normal";

        if (bmi < 18.5) statusKesehatan = "Kekurangan Berat Badan";
        else if (bmi >= 25) statusKesehatan = "Kelebihan Berat Badan";

        let disabilityText = "Sehat";
        if (userBio.disability === "wheelchair") disabilityText = "Pengguna Kursi Roda";
        if (userBio.disability === "asthma") disabilityText = "Asma Ringan";
        if (userBio.disability === "joint_pain") disabilityText = "Nyeri Sendi";

        profileStatus.textContent = `${statusKesehatan} | ${disabilityText}`;

        generateRecommendations();
        generateTimerRecommendation();
    }

    function generateRecommendations() {
        let recs = [];

        // Rule-based AI Engine
        if (userBio.disability === 'wheelchair') {
            recs.push({ title: "Senam Lengan / Upper Body Workout", desc: "Fokus pada kekuatan otot bahu dan lengan. Intensitas ringan-sedang." });
            recs.push({ title: "Yoga Kursi (Chair Yoga)", desc: "Meningkatkan fleksibilitas dan pernapasan." });
        } else if (userBio.disability === 'asthma') {
            recs.push({ title: "Jalan Santai", desc: "Olahraga kardio ringan, perhatikan ritme napas." });
            recs.push({ title: "Berenang (jika memungkinkan)", desc: "Sangat baik untuk kapasitas paru-paru." });
        } else if (userBio.disability === 'joint_pain' || userBio.age > 50) {
            recs.push({ title: "Senam Tai Chi", desc: "Gerakan lambat, low impact, sangat ramah pada persendian." });
            recs.push({ title: "Sepeda Statis", desc: "Melatih otot kaki tanpa benturan pada sendi lutut." });
        } else {
            // Sehat & Usia < 50
            const heightM = userBio.height / 100;
            const bmi = userBio.weight / (heightM * heightM);
            
            if (bmi >= 25) {
                recs.push({ title: "Jalan Cepat / Jogging Ringan", desc: "Fokus membakar kalori secara stabil." });
                recs.push({ title: "Berenang", desc: "Olahraga kardio yang membakar banyak kalori tanpa beban berlebih pada tulang." });
            } else {
                recs.push({ title: "Lari Jarak Menengah / HIIT", desc: "Untuk meningkatkan stamina kardiovaskular secara maksimal." });
                recs.push({ title: "Angkat Beban / Calisthenics", desc: "Untuk membentuk dan mempertahankan massa otot." });
            }
        }

        rekomendasiList.innerHTML = '';
        recs.forEach(r => {
            const div = document.createElement('div');
            div.className = 'rek-item';
            div.innerHTML = `<h4>${r.title}</h4><p>${r.desc}</p>`;
            rekomendasiList.appendChild(div);
        });
    }

    function getRecommendedMinutes() {
        if (!userBio) return 15;

        let minutes = 30; // Default

        if (userBio.disability !== 'none') minutes = 15;
        else if (userBio.age > 50) minutes = 20;
        else if (userBio.age < 15) minutes = 20;
        else minutes = 45;

        return minutes;
    }

    function generateTimerRecommendation() {
        const mins = getRecommendedMinutes();
        aiTimerRecommendation.textContent = `${mins} Menit`;
    }

    // --- Timer Logic ---
    let isTimerRunning = false;
    
    function updateTimerDisplay() {
        const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const s = (timeRemaining % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
    }

    function setupTimer() {
        timeRemaining = getRecommendedMinutes() * 60;
        updateTimerDisplay();
        stopTimer();
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
                timeRemaining--;
                updateTimerDisplay();
            } else {
                stopTimer();
                alert("Waktu Habis! Kerja bagus menyelesaikan olahraga hari ini!");
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }

    btnStartTimer.addEventListener('click', startTimer);
    btnPauseTimer.addEventListener('click', stopTimer);
    btnResetTimer.addEventListener('click', () => {
        stopTimer();
        setupTimer();
    });
});
