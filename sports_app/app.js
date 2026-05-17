// --- FITAI APP LOGIC ---

// 1. DATABASE INITIALIZATION (LOCAL STORAGE)
const defaultAdmin = {
    name: "Administrator",
    email: "admin@fitai.com",
    password: "admin123",
    role: "admin"
};

let users = JSON.parse(localStorage.getItem('fitai_users')) || [];
let feedbacks = JSON.parse(localStorage.getItem('fitai_feedbacks')) || [];

// Ensure admin exists in DB
if (!users.some(u => u.email === defaultAdmin.email)) {
    users.push(defaultAdmin);
    localStorage.setItem('fitai_users', JSON.stringify(users));
}

let currentUser = JSON.parse(localStorage.getItem('fitai_current_user')) || null;

// 2. DOM ELEMENTS
const authContainer = document.getElementById('auth-container');
const appLayout = document.getElementById('app-layout');
const viewLogin = document.getElementById('view-login');
const viewRegister = document.getElementById('view-register');

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerForm = document.getElementById('register-form');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

const linkToRegister = document.getElementById('link-to-register');
const linkToLogin = document.getElementById('link-to-login');
const btnLogout = document.getElementById('btn-logout');

const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserRole = document.getElementById('sidebar-user-role');
const sidebarUserAvatarInitials = document.getElementById('user-avatar-initials');
const menuUserList = document.getElementById('menu-user-list');
const menuAdminList = document.getElementById('menu-admin-list');

const navItems = document.querySelectorAll('.nav-item');
const contentViews = document.querySelectorAll('.content-view');

const modalMultiDevice = document.getElementById('modal-multi-device');
const btnMultiDeviceOk = document.getElementById('btn-multi-device-ok');

// 3. PAGE NAVIGATION
function switchFullView(showApp) {
    if (showApp) {
        authContainer.classList.add('hidden');
        appLayout.classList.remove('hidden');
        setupAppForRole();
    } else {
        authContainer.classList.remove('hidden');
        appLayout.classList.add('hidden');
        viewLogin.classList.add('active');
        viewRegister.classList.remove('active');
    }
}

linkToRegister.addEventListener('click', () => {
    viewLogin.classList.remove('active');
    viewRegister.classList.add('active');
});

linkToLogin.addEventListener('click', () => {
    viewRegister.classList.remove('active');
    viewLogin.classList.add('active');
});

// Sidebar Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');
        
        // Remove active from all nav items and views in the currently active role menu
        const activeList = currentUser.role === 'admin' ? menuAdminList : menuUserList;
        activeList.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        contentViews.forEach(view => view.classList.remove('active-view'));
        
        // Set active to clicked one
        item.classList.add('active');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active-view');
        }
        
        // Load data on view switch if needed
        if (targetId === 'view-dashboard') renderDashboard();
        if (targetId === 'view-rekomendasi') renderRecommendations();
        if (targetId === 'view-misi') renderMissions();
        if (targetId === 'view-timer') renderTimerView();
        if (targetId === 'view-riwayat') renderHistoryList();
        if (targetId === 'view-admin-users') renderAdminUsersTable();
        if (targetId === 'view-admin-feedbacks') renderAdminFeedbacks();
    });
});

// 4. AUTHENTICATION CONTROLLER
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = regName.value.trim();
    const email = regEmail.value.trim().toLowerCase();
    const password = regPassword.value;

    // Email unique validation
    if (users.some(user => user.email === email)) {
        alert('❌ Error: Email sudah terdaftar! Gunakan email lain.');
        return;
    }

    const newUser = {
        name,
        email,
        password,
        role: "user",
        bio: null,
        history: [],
        checkedMissions: { warmup: false, workout: false, hydrate: false }
    };

    users.push(newUser);
    localStorage.setItem('fitai_users', JSON.stringify(users));
    alert('🎉 Registrasi Berhasil! Silakan login dengan akun Anda.');
    registerForm.reset();
    viewRegister.classList.remove('active');
    viewLogin.classList.add('active');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;

    const matchedUser = users.find(u => u.email === email && u.password === password);

    if (!matchedUser) {
        alert('❌ Error: Email atau Kata Sandi salah!');
        return;
    }

    // Generate unique session ID for multi-device detection
    const newSessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now();
    
    // Update session ID in the persistent users list
    const uIndex = users.findIndex(u => u.email === matchedUser.email);
    if (uIndex !== -1) {
        users[uIndex].activeSessionId = newSessionId;
        localStorage.setItem('fitai_users', JSON.stringify(users));
    }
    
    // Save to local storage variables
    localStorage.setItem('fitai_session_id', newSessionId);
    
    currentUser = matchedUser;
    currentUser.activeSessionId = newSessionId;
    localStorage.setItem('fitai_current_user', JSON.stringify(currentUser));
    
    loginForm.reset();
    switchFullView(true);
});

btnLogout.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('fitai_current_user');
    localStorage.removeItem('fitai_session_id');
    switchFullView(false);
});

// Setup sidebar and default view based on logged-in role
function setupAppForRole() {
    if (!currentUser) return;

    const name = currentUser.name || "User";
    sidebarUserName.textContent = name;
    sidebarUserRole.textContent = currentUser.role === 'admin' ? 'Administrator' : 'User';
    sidebarUserAvatarInitials.textContent = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Reset view visibility
    contentViews.forEach(v => v.classList.remove('active-view'));
    navItems.forEach(n => n.classList.remove('active'));

    if (currentUser.role === 'admin') {
        menuUserList.classList.add('hidden');
        menuAdminList.classList.remove('hidden');
        
        // Show Admin Table as default
        menuAdminList.querySelector('[data-target="view-admin-users"]').classList.add('active');
        document.getElementById('view-admin-users').classList.add('active-view');
        renderAdminUsersTable();
    } else {
        menuUserList.classList.remove('hidden');
        menuAdminList.classList.add('hidden');
        
        // Show Dashboard as default
        menuUserList.querySelector('[data-target="view-dashboard"]').classList.add('active');
        document.getElementById('view-dashboard').classList.add('active-view');
        renderDashboard();
    }
}

// 5. USER BIOMETRIC CONTROLLER
const identitasForm = document.getElementById('identitas-form');
const inpAge = document.getElementById('age');
const inpWeight = document.getElementById('weight');
const inpHeight = document.getElementById('height');
const inpDisability = document.getElementById('disability');

identitasForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const age = parseInt(inpAge.value);
    const weight = parseFloat(inpWeight.value);
    const height = parseFloat(inpHeight.value);
    const disability = inpDisability.value;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    currentUser.bio = { age, weight, height, disability, bmi };
    
    // Save to user array
    updateUserInDatabase(currentUser);
    alert('💪 Profil Biometrik berhasil diperbarui! Rekomendasi olahraga & makanan Anda siap dilihat.');
    
    // Switch to Recommendations
    menuUserList.querySelector('.nav-item.active').classList.remove('active');
    contentViews.forEach(v => v.classList.remove('active-view'));
    
    menuUserList.querySelector('[data-target="view-rekomendasi"]').classList.add('active');
    document.getElementById('view-rekomendasi').classList.add('active-view');
    renderRecommendations();
});

function updateUserInDatabase(userObj) {
    users = users.map(u => u.email === userObj.email ? userObj : u);
    localStorage.setItem('fitai_users', JSON.stringify(users));
    localStorage.setItem('fitai_current_user', JSON.stringify(userObj));
    currentUser = userObj;
}

// 6. DASHBOARD RENDERING
const aiMotivationText = document.getElementById('ai-motivation-text');
const dashAge = document.getElementById('dash-age');
const dashBmi = document.getElementById('dash-bmi');
const dashStatus = document.getElementById('dash-status');
const dashDisability = document.getElementById('dash-disability');
const dashProgressFill = document.getElementById('dash-progress-fill');
const dashProgressPercent = document.getElementById('dash-progress-percent');

function renderDashboard() {
    if (!currentUser || currentUser.role === 'admin') return;

    // Setup input fields in profile form with existing values
    if (currentUser.bio) {
        inpAge.value = currentUser.bio.age;
        inpWeight.value = currentUser.bio.weight;
        inpHeight.value = currentUser.bio.height;
        inpDisability.value = currentUser.bio.disability;

        // Render dashboard values
        dashAge.textContent = `${currentUser.bio.age} Tahun`;
        dashBmi.textContent = currentUser.bio.bmi.toFixed(1);
        dashDisability.textContent = getDisabilityLabel(currentUser.bio.disability);

        // BMI Status
        let status = "";
        if (currentUser.bio.bmi < 18.5) {
            status = "Kurang Berat Badan (Underweight)";
        } else if (currentUser.bio.bmi < 24.9) {
            status = "Ideal (Normal)";
        } else {
            status = "Kelebihan Berat Badan (Overweight)";
        }
        dashStatus.textContent = status;

        // Generate AI Motivation Quote
        aiMotivationText.textContent = generateAIMotivation(currentUser.bio);
    } else {
        dashAge.textContent = "--";
        dashBmi.textContent = "--";
        dashStatus.textContent = "--";
        dashDisability.textContent = "--";
        aiMotivationText.textContent = "Silakan lengkapi profil biometrik Anda terlebih dahulu di menu sebelah kiri agar AI dapat menyusun kalimat motivasi khusus untuk Anda!";
    }

    // Load progress missions on Dashboard
    updateMissionsProgressBar();
}

function getDisabilityLabel(code) {
    switch(code) {
        case 'wheelchair': return 'Pengguna Kursi Roda';
        case 'asthma': return 'Asma Ringan';
        case 'joint_pain': return 'Nyeri Sendi/Lansia';
        default: return 'Tidak Ada (Sehat bugar)';
    }
}

// AI Motivation Engine (Customized HSL sporty rules)
function generateAIMotivation(bio) {
    const name = currentUser.name;
    if (bio.disability === 'wheelchair') {
        return `🔥 Halo ${name}! AI mendeteksi kemauan luar biasa dari dalam diri Anda. Keterbatasan fisik bukan halangan untuk bugar! Fokus melatih tubuh bagian atas Anda hari ini, kekuatan sejati ada di pikiran Anda. Semangat!`;
    }
    if (bio.disability === 'asthma') {
        return `🌿 Halo ${name}! Tetap melangkah dengan ritme yang stabil. AI menganalisis bahwa olahraga ringan yang teratur adalah kunci memperkuat daya tampung paru-paru Anda secara aman. Jaga nafas, dengarkan tubuh Anda, Anda hebat!`;
    }
    if (bio.disability === 'joint_pain' || bio.age > 50) {
        return `🌻 Halo ${name}! Usia dan nyeri sendi hanyalah angka. AI menyarankan gerakan lembut Tai Chi atau peregangan ringan hari ini. Setiap gerakan kecil Anda sangat berjasa melumasi persendian agar tetap awet muda. Tetap bergerak indah!`;
    }
    
    // Normal users motivation based on BMI
    if (bio.bmi >= 25) {
        return `⚡ Halo ${name}! Setiap tetes keringat hari ini adalah kalori yang terbakar menuju bentuk tubuh ideal Anda. AI mendukung program defisit kalori Anda bersama porsi Tempe & Ikan Kembung yang mengenyangkan. Hancurkan target latihan Anda!`;
    }
    if (bio.bmi < 18.5) {
        return `💪 Halo ${name}! Mari bangun massa otot yang kuat. AI menyarankan latihan beban kalistenik berintensitas teratur hari ini, diselingi nutrisi protein murah melimpah dari Telur Rebus dan Ubi Jalar. Konsistensi adalah kunci pertumbuhan!`;
    }
    return `🏆 Halo ${name}! Tubuh Anda berada dalam kondisi Ideal! Pertahankan keseimbangan bugar ini. Lakukan olahraga harian dengan gembira dan nikmati energi positif melimpah hari ini! AI memuji kedisiplinan Anda!`;
}

// 7. RECOMMENDATIONS CONTROLLER
const recsWorkoutContainer = document.getElementById('recs-workout-container');
const recsNutritionContainer = document.getElementById('recs-nutrition-container');

function renderRecommendations() {
    if (!currentUser || !currentUser.bio) {
        recsWorkoutContainer.innerHTML = '<p class="muted-text">Silakan lengkapi profil biometrik terlebih dahulu agar AI dapat memberikan rekomendasi.</p>';
        recsNutritionContainer.innerHTML = '<p class="muted-text">Silakan lengkapi profil biometrik terlebih dahulu agar AI dapat memberikan rekomendasi gizi.</p>';
        return;
    }

    const { disability, bmi } = currentUser.bio;

    // A. Workout Recommendation
    let workoutHTML = "";
    if (disability === 'wheelchair') {
        workoutHTML = `
            <div class="rek-item">
                <h4>1. Angkat Beban Duduk (Dumbbell Press)</h4>
                <p>Menggunakan botol air mineral bekas yang diisi pasir sebagai beban alternatif murah. Melatih kekuatan otot bahu dan lengan.</p>
            </div>
            <div class="rek-item">
                <h4>2. Putaran Lengan Duduk (Arm Circles)</h4>
                <p>Rentangkan tangan ke samping dan putar perlahan secara melingkar selama 3 menit untuk fleksibilitas sendi bahu.</p>
            </div>
            <div class="rek-item">
                <h4>3. Yoga Kursi (Chair Yoga)</h4>
                <p>Latihan peregangan dada dan punggung atas di atas kursi untuk merilekskan tulang belakang secara aman.</p>
            </div>
        `;
    } else if (disability === 'asthma') {
        workoutHTML = `
            <div class="rek-item">
                <h4>1. Jalan Santai (Walking)</h4>
                <p>Durasi stabil dengan nafas teratur. Melatih ketahanan kardio secara bertahap tanpa membebani paru-paru secara ekstrem.</p>
            </div>
            <div class="rek-item">
                <h4>2. Berenang Ringan (Swimming)</h4>
                <p>Udara lembab di kolam renang sangat bersahabat bagi penderita asma. Melatih kapasitas pernafasan.</p>
            </div>
            <div class="rek-item">
                <h4>3. Senam Peregangan Dalam</h4>
                <p>Latihan melatih ekspansi rongga dada untuk melancarkan sirkulasi oksigen.</p>
            </div>
        `;
    } else if (disability === 'joint_pain') {
        workoutHTML = `
            <div class="rek-item">
                <h4>1. Senam Tai Chi</h4>
                <p>Gerakan mengalir lambat yang melatih keseimbangan, kekuatan kaki, dan melumasi persendian tanpa benturan keras.</p>
            </div>
            <div class="rek-item">
                <h4>2. Sepeda Statis Santai</h4>
                <p>Latihan kardio berdampak rendah (*low impact*) yang sangat ramah terhadap sendi lutut.</p>
            </div>
            <div class="rek-item">
                <h4>3. Peregangan Fleksibilitas Sendi</h4>
                <p>Gerakan memutar pergelangan tangan, kaki, dan leher secara lembut.</p>
            </div>
        `;
    } else {
        // Normal users
        if (bmi >= 25) {
            workoutHTML = `
                <div class="rek-item">
                    <h4>1. Jalan Cepat / Power Walking</h4>
                    <p>Membakar lemak secara efisien dengan risiko cedera sendi kaki yang rendah akibat kelebihan berat badan.</p>
                </div>
                <div class="rek-item">
                    <h4>2. Senam Aerobik Kardio</h4>
                    <p>Memicu denyut jantung di zona pembakaran lemak secara optimal selama 30 menit.</p>
                </div>
                <div class="rek-item">
                    <h4>3. Latihan Beban Tubuh (Squat & Plank)</h4>
                    <p>Membangun otot besar di paha dan perut untuk mempercepat laju metabolisme pembakaran lemak harian.</p>
                </div>
            `;
        } else if (bmi < 18.5) {
            workoutHTML = `
                <div class="rek-item">
                    <h4>1. Kalistenik Penguat Otot (Push-Up & Pull-Up)</h4>
                    <p>Menggunakan berat tubuh sendiri untuk merangsang hipertrofi (pertumbuhan) kekuatan serat otot lengan dan dada.</p>
                </div>
                <div class="rek-item">
                    <h4>2. Bodyweight Squats & Lunges</h4>
                    <p>Membangun massa otot bagian bawah (paha dan bokong) secara efektif.</p>
                </div>
                <div class="rek-item">
                    <h4>3. Istirahat Cukup & Hindari Kardio Berlebih</h4>
                    <p>Fokus membangun massa otot dan kurangi lari jarak jauh agar kalori yang masuk bisa digunakan untuk pertumbuhan.</p>
                </div>
            `;
        } else {
            workoutHTML = `
                <div class="rek-item">
                    <h4>1. Lari Jarak Menengah (Jogging)</h4>
                    <p>Melatih kebugaran jantung dan paru-paru secara menyeluruh untuk ketahanan fisik.</p>
                </div>
                <div class="rek-item">
                    <h4>2. HIIT (High-Intensity Interval Training)</h4>
                    <p>Latihan sirkuit cepat 15 menit untuk meningkatkan ketahanan anaerobik dan kelincahan tubuh.</p>
                </div>
                <div class="rek-item">
                    <h4>3. Full Body Calisthenics</h4>
                    <p>Variasi push-up, squat, plank, dan burpee untuk kebugaran tubuh seimbang.</p>
                </div>
            `;
        }
    }
    recsWorkoutContainer.innerHTML = workoutHTML;

    // B. Cheap & Nutritious Indonesian Food Recommendation
    let nutritionHTML = "";
    let foodList = [];

    // Base on BMI
    if (bmi >= 25) {
        foodList.push(
            { name: "Tempe Kukus / Panggang", desc: "Tinggi protein nabati berkualitas tinggi, tinggi serat pangan, dan sangat murah. Memberikan rasa kenyang tahan lama tanpa kalori berlebih.", price: "Rp 5.000 - Rp 8.000 / papan" },
            { name: "Putih Telur Rebus", desc: "Sumber protein hewani termurni tanpa kandungan kolesterol kuning telur. Membantu mempertahankan massa otot selama defisit kalori.", price: "Rp 2.000 / butir" },
            { name: "Tumis Kangkung / Bayam Bening", desc: "Sangat rendah kalori namun sangat kaya serat pangan, zat besi, dan vitamin. Menjaga volume lambung agar tetap kenyang secara sehat.", price: "Rp 3.000 / ikat" }
        );
    } else if (bmi < 18.5) {
        foodList.push(
            { name: "Ubi Jalar Rebus", desc: "Karbohidrat kompleks yang padat kalori sehat, vitamin A, dan kalium. Bagus untuk menambah kalori tanpa lemak jenuh.", price: "Rp 5.000 / kg" },
            { name: "Telur Rebus Utuh", desc: "Kombinasi lemak sehat dan protein lengkap berkualitas tinggi di kuning dan putih telurnya. Bagus untuk merangsang sintesis otot.", price: "Rp 2.500 / butir" },
            { name: "Pisang Ambon / Raja", desc: "Kalori tinggi yang cepat dicerna, kaya kalium untuk memulihkan glikogen otot setelah berlatih fisik.", price: "Rp 10.000 / sisir" }
        );
    } else {
        foodList.push(
            { name: "Pepes Tahu & Tempe", desc: "Lauk protein kombinasi nabati lengkap yang dimasak dengan cara dikukus dibungkus daun pisang tanpa minyak jenuh.", price: "Rp 5.000" },
            { name: "Nasi Merah Lokal / Jagung Rebus", desc: "Sumber energi utama dengan indeks glikemik rendah, menjaga kadar gula darah dan stamina tetap stabil sepanjang hari.", price: "Rp 6.000 / porsi" }
        );
    }

    // Base on Medical / Disability status (Anti-Inflammatory & vitamin booster)
    if (disability === 'joint_pain') {
        foodList.unshift(
            { name: "Ikan Kembung Panggang (Superfood)", desc: "Sangat kaya akan asam lemak Omega-3 alami (penelitian membuktikan kandungannya **lebih tinggi dari Salmon**) untuk meredakan radang dan nyeri sendi secara signifikan dengan harga merakyat.", price: "Rp 15.000 / ekor" },
            { name: "Wedang Jahe Kunyit Hangat", desc: "Minuman herbal anti-inflamasi alami yang sangat kuat. Kunyit mengandung kurkumin yang terbukti meredakan rasa kaku pada persendian lansia.", price: "Rp 3.000 / gelas" }
        );
    } else if (disability === 'asthma') {
        foodList.unshift(
            { name: "Wedang Jahe Hangat", desc: "Jahe mengandung zat aktif gingerol yang membantu mengendurkan otot-otot halus pada saluran pernafasan bronchial agar lega.", price: "Rp 2.000 / gelas" },
            { name: "Buah Jeruk Lokal / Mangga", desc: "Sangat tinggi Vitamin C sebagai antioksidan alami untuk meredakan sensitivitas radang paru-paru dari polusi.", price: "Rp 10.000 / kg" }
        );
    } else if (disability === 'wheelchair') {
        foodList.unshift(
            { name: "Susu Kedelai Murni / Yogurt Lokal", desc: "Tinggi Kalsium dan Vitamin D untuk mencegah pengeroposan tulang (*osteoporosis*) akibat minimnya benturan beban fisik di kaki.", price: "Rp 5.000 / gelas" },
            { name: "Tumis Sawi Hijau", desc: "Kaya serat untuk merangsang kesehatan pencernaan yang optimal, dikarenakan intensitas bergerak sehari-hari yang terbatas di kursi roda.", price: "Rp 3.000 / ikat" }
        );
    }

    // Render food list
    foodList.forEach(food => {
        nutritionHTML += `
            <div class="rek-item" style="border-left-color: var(--accent-cyan)">
                <h4>${food.name}</h4>
                <p>${food.desc}</p>
                <span class="price-tag">Estimasi Harga: ${food.price}</span>
            </div>
        `;
    });
    recsNutritionContainer.innerHTML = nutritionHTML;
}

// 8. DAILY MISSION CONTROLLER & SAVING PROGRESS
const cWarmup = document.getElementById('misi-warmup');
const cWorkout = document.getElementById('misi-workout');
const cHydrate = document.getElementById('misi-hydrate');
const missionProgressText = document.getElementById('mission-progress-text');
const missionProgressBar = document.getElementById('mission-progress-bar');
const aiAppreciationCard = document.getElementById('ai-appreciation-card');
const aiAppreciationTextContent = document.getElementById('ai-appreciation-text-content');
const btnCloseAppreciation = document.getElementById('btn-close-appreciation');
const btnSaveHistory = document.getElementById('btn-save-history');

function renderMissions() {
    if (!currentUser) return;
    
    // Load existing state from user object
    const state = currentUser.checkedMissions || { warmup: false, workout: false, hydrate: false };
    cWarmup.checked = state.warmup;
    cWorkout.checked = state.workout;
    cHydrate.checked = state.hydrate;

    updateMissionsProgressBar();
}

function updateMissionsProgressBar() {
    if (!currentUser || currentUser.role === 'admin') return;

    const checklist = currentUser.checkedMissions || { warmup: false, workout: false, hydrate: false };
    let checkedCount = 0;
    if (checklist.warmup) checkedCount++;
    if (checklist.workout) checkedCount++;
    if (checklist.hydrate) checkedCount++;

    const total = 3;
    const percentage = Math.round((checkedCount / total) * 100);

    // Update Missions View Elements
    if (missionProgressBar) {
        missionProgressBar.style.width = `${percentage}%`;
    }
    if (missionProgressText) {
        missionProgressText.textContent = `${percentage}% (${checkedCount} dari ${total} Misi)`;
    }

    // Update Dashboard Elements
    if (dashProgressFill) {
        dashProgressFill.style.width = `${percentage}%`;
    }
    if (dashProgressPercent) {
        dashProgressPercent.textContent = `${percentage}% Selesai`;
    }

    // AI APPRECIATION POPUP (Triggers dynamically at 100%)
    if (percentage === 100) {
        showAIAppreciationPopup();
    } else {
        if (aiAppreciationCard) aiAppreciationCard.classList.add('hidden');
    }
}

// Save checked status on click
[cWarmup, cWorkout, cHydrate].forEach(cb => {
    cb.addEventListener('change', () => {
        currentUser.checkedMissions = {
            warmup: cWarmup.checked,
            workout: cWorkout.checked,
            hydrate: cHydrate.checked
        };
        updateUserInDatabase(currentUser);
        updateMissionsProgressBar();
    });
});

function showAIAppreciationPopup() {
    if (!aiAppreciationCard) return;
    const name = currentUser.name;
    
    // Customize appreciation text based on profile
    let appText = `🎉 Luar biasa, **${name}**! AI kami mencatat Anda telah menyelesaikan seluruh misi hidup sehat hari ini dengan dedikasi 100%! Konsistensi ini adalah langkah emas untuk hidup bugar. Pertahankan prestasi hebat Anda esok hari!`;
    if (currentUser.bio && currentUser.bio.disability !== 'none') {
        appText = `🏆 Kejuaraan Sejati, **${name}**! AI kami sangat bangga atas perjuangan luar biasa Anda menyelesaikan seluruh misi harian hari ini dengan kondisi fisik khusus Anda. Anda membuktikan bahwa ketegaran mental bisa melompati batas fisik. Hormat kami atas kerja keras Anda hari ini!`;
    }
    
    aiAppreciationTextContent.innerHTML = appText;
    aiAppreciationCard.classList.remove('hidden');
}

btnCloseAppreciation.addEventListener('click', () => {
    aiAppreciationCard.classList.add('hidden');
});

// SAVE TO HISTORY LOG (Selesai/Tidak Selesai & Tanggal)
btnSaveHistory.addEventListener('click', () => {
    if (!currentUser) return;

    // Get current date
    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const checklist = currentUser.checkedMissions || { warmup: false, workout: false, hydrate: false };
    
    let checkedCount = 0;
    if (checklist.warmup) checkedCount++;
    if (checklist.workout) checkedCount++;
    if (checklist.hydrate) checkedCount++;
    const percentage = Math.round((checkedCount / 3) * 100);

    const historyRecord = {
        date: formattedDate,
        percentage,
        warmup: checklist.warmup ? "Selesai" : "Tidak Selesai",
        workout: checklist.workout ? "Selesai" : "Tidak Selesai",
        hydrate: checklist.hydrate ? "Selesai" : "Tidak Selesai"
    };

    // Ensure history array exists
    if (!currentUser.history) {
        currentUser.history = [];
    }

    // Check if record for today already exists, if so update it, else push new
    const existingIndex = currentUser.history.findIndex(r => r.date === formattedDate);
    if (existingIndex !== -1) {
        currentUser.history[existingIndex] = historyRecord;
    } else {
        currentUser.history.push(historyRecord);
    }

    updateUserInDatabase(currentUser);
    alert(`💾 Riwayat misi harian tanggal ${formattedDate} telah berhasil dikunci dan disimpan!`);
});

// 9. SPORTS TIMER WITH CONTROLLER & AI RECOMMENDATION
const timerAIRecommend = document.getElementById('timer-ai-recommendation');
const timerTimeDisplay = document.getElementById('timer-time-display');
const btnTimerStart = document.getElementById('btn-timer-start');
const btnTimerPause = document.getElementById('btn-timer-pause');
const btnTimerReset = document.getElementById('btn-timer-reset');
const timerCircle = document.querySelector('.timer-circle');

let timerInterval = null;
let totalSeconds = 0;
let initialSeconds = 0;

function renderTimerView() {
    if (!currentUser) return;
    
    // Reset any running timer
    resetTimer();

    // Determine workout duration automatically using AI profile Rules
    let minutes = 30; // default normal
    if (currentUser.bio) {
        const { disability, age } = currentUser.bio;
        if (disability === 'wheelchair' || disability === 'asthma' || disability === 'joint_pain') {
            minutes = 15; // Safe duration for physical limitations
        } else if (age < 15 || age > 50) {
            minutes = 20; // Safe duration for juniors and seniors
        } else {
            minutes = 45; // Performance duration for young healthy adults
        }
    }
    
    timerAIRecommend.textContent = `${minutes} Menit`;
    totalSeconds = minutes * 60;
    initialSeconds = totalSeconds;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timerTimeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

btnTimerStart.addEventListener('click', () => {
    if (timerInterval) return; // already running

    timerCircle.classList.add('active-timer');
    timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerCircle.classList.remove('active-timer');
            
            // Play simple audio cue if possible or just trigger AI popup
            alert(`🏆 Selamat! Sesi Latihan Fisik Anda Selesai!\nApresiasi AI: "Kerja keras yang menakjubkan, ${currentUser.name}! Anda baru saja melatih otot dan jantung Anda secara terukur. Luar biasa!"`);
            resetTimer();
        } else {
            totalSeconds--;
            updateTimerDisplay();
        }
    }, 1000);
});

btnTimerPause.addEventListener('click', () => {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
    timerCircle.classList.remove('active-timer');
});

btnTimerReset.addEventListener('click', () => {
    resetTimer();
});

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerCircle.classList.remove('active-timer');
    totalSeconds = initialSeconds;
    updateTimerDisplay();
}

// 10. HISTORY LOG LIST RENDERING
const historyListContainer = document.getElementById('history-list-container');

function renderHistoryList() {
    if (!currentUser) return;

    const histList = currentUser.history || [];
    if (histList.length === 0) {
        historyListContainer.innerHTML = '<p class="muted-text">Belum ada riwayat aktivitas yang tercatat. Selesaikan misi harian Anda dan simpan riwayatnya!</p>';
        return;
    }

    // Render chronologically (newest first)
    let historyHTML = "";
    [...histList].reverse().forEach(record => {
        const warmupClass = record.warmup === "Selesai" ? "success-status" : "fail-status";
        const workoutClass = record.workout === "Selesai" ? "success-status" : "fail-status";
        const hydrateClass = record.hydrate === "Selesai" ? "success-status" : "fail-status";

        historyHTML += `
            <div class="history-item">
                <div class="history-meta">
                    <span class="history-date">📅 Tanggal: ${record.date}</span>
                    <span class="history-pct">Progress: ${record.percentage}%</span>
                </div>
                <div class="history-missions">
                    <div class="history-m-label ${warmupClass}">Warmup: ${record.warmup}</div>
                    <div class="history-m-label ${workoutClass}">Workout: ${record.workout}</div>
                    <div class="history-m-label ${hydrateClass}">Nutrisi & Air: ${record.hydrate}</div>
                </div>
            </div>
        `;
    });
    historyListContainer.innerHTML = historyHTML;
}

// 11. USER FEEDBACK & STARS CONTROLLER
const starBtns = document.querySelectorAll('.star-btn');
const feedbackRatingValue = document.getElementById('feedback-rating-value');
const feedbackForm = document.getElementById('feedback-form');
const feedbackReview = document.getElementById('feedback-review');
const feedbackReport = document.getElementById('feedback-report');

starBtns.forEach(star => {
    star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'));
        feedbackRatingValue.value = val;
        highlightStars(val);
    });

    star.addEventListener('mouseenter', () => {
        const val = parseInt(star.getAttribute('data-value'));
        highlightStars(val, true);
    });

    star.addEventListener('mouseleave', () => {
        const currentVal = parseInt(feedbackRatingValue.value);
        highlightStars(currentVal);
    });
});

function highlightStars(val, isHover = false) {
    starBtns.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-value'));
        if (starVal <= val) {
            if (isHover) {
                star.classList.add('hovered');
            } else {
                star.classList.add('selected');
                star.classList.remove('hovered');
            }
        } else {
            star.classList.remove('selected', 'hovered');
        }
    });
}

feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = parseInt(feedbackRatingValue.value);
    const review = feedbackReview.value.trim();
    const report = feedbackReport.value.trim();

    if (rating === 0) {
        alert('❌ Error: Mohon berikan penilaian bintang (rating) terlebih dahulu!');
        return;
    }

    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const newFeedback = {
        userName: currentUser.name,
        userEmail: currentUser.email,
        date: formattedDate,
        rating,
        review,
        report: report || null
    };

    feedbacks.push(newFeedback);
    localStorage.setItem('fitai_feedbacks', JSON.stringify(feedbacks));

    alert('💖 Terima kasih! Masukan Anda telah berhasil terkirim ke database Admin untuk evaluasi berkala.');
    feedbackForm.reset();
    highlightStars(0);
    feedbackRatingValue.value = "0";
});

// 12. ADMIN PORTAL RENDERERS
const adminTotalUsers = document.getElementById('admin-total-users');
const adminUsersTbody = document.getElementById('admin-users-tbody');
const adminReviewsList = document.getElementById('admin-reviews-list');
const adminReportsList = document.getElementById('admin-reports-list');

function renderAdminUsersTable() {
    if (!currentUser || currentUser.role !== 'admin') return;

    // Filter out admin accounts from display count
    const normalUsers = users.filter(u => u.role !== 'admin');
    adminTotalUsers.textContent = normalUsers.length;

    if (normalUsers.length === 0) {
        adminUsersTbody.innerHTML = '<tr><td colspan="5" class="muted-text" style="text-align: center">Belum ada pengguna biasa yang mendaftar.</td></tr>';
        return;
    }

    let tbodyHTML = "";
    normalUsers.forEach(user => {
        let ageStr = "--";
        let bmiStr = "--";
        let disabilityStr = "Tidak Ada Profil";

        if (user.bio) {
            ageStr = `${user.bio.age} Thn`;
            
            let status = "";
            if (user.bio.bmi < 18.5) status = "Underweight";
            else if (user.bio.bmi < 24.9) status = "Ideal";
            else status = "Overweight";
            
            bmiStr = `${user.bio.bmi.toFixed(1)} (${status})`;
            disabilityStr = getDisabilityLabel(user.bio.disability);
        }

        tbodyHTML += `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${ageStr}</td>
                <td>${bmiStr}</td>
                <td>${disabilityStr}</td>
            </tr>
        `;
    });
    adminUsersTbody.innerHTML = tbodyHTML;
}

function renderAdminFeedbacks() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const allFeedbacks = JSON.parse(localStorage.getItem('fitai_feedbacks')) || [];

    // Filter Feedbacks
    const reviewsOnly = allFeedbacks.filter(f => f.review !== "");
    const reportsOnly = allFeedbacks.filter(f => f.report && f.report !== "");

    // Render Reviews
    if (reviewsOnly.length === 0) {
        adminReviewsList.innerHTML = '<p class="muted-text">Belum ada ulasan/rating masuk.</p>';
    } else {
        let reviewsHTML = "";
        [...reviewsOnly].reverse().forEach(feed => {
            const starsStr = "★".repeat(feed.rating) + "☆".repeat(5 - feed.rating);
            reviewsHTML += `
                <div class="feed-card">
                    <div class="feed-card-header">
                        <strong>👤 ${feed.userName}</strong>
                        <span>📅 ${feed.date}</span>
                    </div>
                    <div class="feed-stars">${starsStr}</div>
                    <div class="feed-content">"${feed.review}"</div>
                </div>
            `;
        });
        adminReviewsList.innerHTML = reviewsHTML;
    }

    // Render Reports
    if (reportsOnly.length === 0) {
        adminReportsList.innerHTML = '<p class="muted-text">Belum ada laporan kendala/bug masuk. Aplikasi berjalan normal.</p>';
    } else {
        let reportsHTML = "";
        [...reportsOnly].reverse().forEach(feed => {
            reportsHTML += `
                <div class="feed-card" style="border-left: 5px solid var(--accent-alert)">
                    <div class="feed-card-header">
                        <strong>👤 ${feed.userName} (${feed.userEmail})</strong>
                        <span>📅 ${feed.date}</span>
                    </div>
                    <div class="feed-content bug-desc">⚠️ Laporan: "${feed.report}"</div>
                </div>
            `;
        });
        adminReportsList.innerHTML = reportsHTML;
    }
}

// 12. MULTI DEVICE / DUAL SESSION CONTROLLER
function checkSessionValidity() {
    if (!currentUser) return;

    const freshUsers = JSON.parse(localStorage.getItem('fitai_users')) || [];
    const freshUser = freshUsers.find(u => u.email === currentUser.email);
    
    if (freshUser) {
        const localSessionId = localStorage.getItem('fitai_session_id');
        
        if (freshUser.activeSessionId && freshUser.activeSessionId !== localSessionId) {
            modalMultiDevice.classList.remove('hidden');
            currentUser = null;
            localStorage.removeItem('fitai_current_user');
            localStorage.removeItem('fitai_session_id');
        }
    }
}

btnMultiDeviceOk.addEventListener('click', () => {
    modalMultiDevice.classList.add('hidden');
    switchFullView(false);
});

// 13. AUTO BOOTSTRAP CHECK ON PAGE LOAD
window.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        switchFullView(true);
        checkSessionValidity();
    } else {
        switchFullView(false);
    }
    
    // Run validation checks every 2 seconds
    setInterval(checkSessionValidity, 2000);
});
