// 1. THEME
const themeBtn = document.getElementById('themeBtn');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.textContent = '☀️ Light';
}
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  let isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
};

// 1.5 PASSWORD SHOW / HIDE
function togglePassword() {
  let passInput = document.getElementById('password');
  let eye = document.getElementById('eyeIcon');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    eye.textContent = '🙈';
  } else {
    passInput.type = 'password';
    eye.textContent = '👁️';
  }
}

// 2. LOGIN
if (localStorage.getItem('isLoggedIn') === 'yes') {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('homeScreen').style.display = 'flex';
}
function login() {
  let email = document.getElementById('email').value;
  let pass = document.getElementById('password').value;
  if (email === '' || pass === '') { alert('Please enter Email and Password'); return; }
  localStorage.setItem('isLoggedIn', 'yes');
  localStorage.setItem('userEmail', email);
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('homeScreen').style.display = 'flex';
  alert('Login Successful! Welcome');
}

// LOGOUT
function logout() {
  let confirmLogout = confirm("Are you sure you want to Logout?");
  if (confirmLogout) {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    alert('Logout Successful! Goodbye 👋');
    location.reload();
  }
}

// 3. INTERVIEW LOGIC
let questions = [
  "Tell me about yourself.",
  "Why did you choose Computer Science?",
  "What are your skills? Explain one project.",
  "What is your Final Year Project? Explain in detail."
];
let current = 0;
let totalScore = 0;
let allAnswers = [];

function startInterview() {
  let name = document.getElementById('userName').value;
  if (name === '') { alert('Please enter your Name'); return; }
  localStorage.setItem('userName', name);
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('interviewScreen').style.display = 'flex';
  showQuestion();
}
function showQuestion() {
  document.getElementById('progress').innerText = `Question ${current + 1} of ${questions.length}`;
  document.getElementById('questionText').innerText = questions[current];
  document.getElementById('answer').value = '';
}
function calculateAIScore(answer) {
  let score = 0;
  let words = answer.trim().split(/\s+/).length;
  if (words > 5) score += 30;
  if (words > 20) score += 20;
  if (words > 40) score += 20;
  let keywords = ['project', 'skill', 'team', 'learn', 'experience', 'develop', 'problem', 'solution'];
  keywords.forEach(k => { if (answer.toLowerCase().includes(k)) score += 5; });
  if (score > 100) score = 100;
  if (score < 30) score = 30;
  return score;
}
function nextQuestion() {
  let ans = document.getElementById('answer').value;
  if (ans.trim() === '') { alert('Please write or speak your answer'); return; }
  let s = calculateAIScore(ans);
  totalScore += s;
  allAnswers.push({ q: questions[current], a: ans, score: s });
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    let finalScore = Math.round(totalScore / questions.length);
    saveHistory(finalScore);
    document.getElementById('interviewScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'flex';
    document.getElementById('resultScreen').innerHTML = `
      <div class="card">
        <h2>🎉 Interview Complete!</h2>
        <h1 style="font-size:50px; color:#6c5ce7;">${finalScore}%</h1>
        <p>${finalScore >= 70 ? 'Excellent! You are Job Ready ✅' : finalScore >= 50 ? 'Good! Keep Practicing 👍' : 'Need More Practice, Keep Trying 💪'}</p>
        <p><b>AI Feedback:</b> You answered ${allAnswers.length} questions. Your Communication is ${finalScore >= 60 ? 'Good' : 'Needs Improvement'}.</p>
        <button onclick="downloadReport()" style="background:#00b894;">📄 Download PDF Report</button>
        <button onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

// 4. VOICE
function startVoice() {
  let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  alert('Start Speaking... Listening 🎤');
  recognition.onresult = (e) => {
    document.getElementById('answer').value = e.results[0][0].transcript;
  };
}

// 5. PDF REPORT
function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let name = localStorage.getItem('userName') || document.getElementById('userName').value || "Student";
  let finalScore = Math.round(totalScore / questions.length);
  doc.setFontSize(20);
  doc.text("AI-Based Mock Interview System", 20, 20);
  doc.setFontSize(12);
  doc.text("Final Year Project - Interview Report", 20, 30);
  doc.text("----------------------------------------", 20, 35);
  doc.text("Student Name: " + name, 20, 45);
  doc.text("Total Questions: " + questions.length, 20, 55);
  doc.text("Final Score: " + finalScore + "%", 20, 65);
  doc.text("Status: " + (finalScore >= 70 ? "Job Ready" : finalScore >= 50 ? "Good - Need Practice" : "Need More Practice"), 20, 75);
  doc.text("----------------------------------------", 20, 85);
  doc.text("AI Feedback:", 20, 95);
  doc.setFontSize(11);
  doc.text("Candidate answered " + allAnswers.length + " questions.", 20, 105);
  doc.text("Communication skills evaluated by AI scoring", 20, 115);
  doc.text("based on answer length and keywords.", 20, 125);
  doc.text("----------------------------------------", 20, 140);
  doc.text("Generated by AI Interview Coach App", 20, 150);
  doc.save("Interview-Report-" + name + ".pdf");
  alert('PDF Report Downloaded Successfully! 📄');
}

// 6. HISTORY SYSTEM
function saveHistory(score) {
  let history = JSON.parse(localStorage.getItem("interviewHistory")) || [];
  let name = localStorage.getItem('userName') || "Student";
  let now = new Date();
  let newEntry = {
    name: name,
    score: score,
    date: now.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) + " - " + now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  };
  history.push(newEntry);
  localStorage.setItem("interviewHistory", JSON.stringify(history));
}
function showHistory() {
  let history = JSON.parse(localStorage.getItem("interviewHistory")) || [];
  let list = document.getElementById("historyList");
  let box = document.getElementById("historyBox");
  if (history.length === 0) {
    list.innerHTML = "<p style='text-align:center;'>No history yet. Take an interview first.</p>";
  } else {
    list.innerHTML = "";
    [...history].reverse().forEach((item) => {
      let color = item.score >= 70 ? "#00b894" : item.score >= 50 ? "#fdcb6e" : "#d63031";
      let emoji = item.score >= 70 ? '🎉' : item.score >= 50 ? '👍' : '💪';
      list.innerHTML += `<div class="history-item" style="background:#f8f9fa; padding:10px; border-radius:10px; margin:8px 0; border-left:4px solid ${color}; display:flex; justify-content:space-between; align-items:center;"><span><b>${item.score}%</b><br><small>${item.date}</small></span><span style="font-size:22px;">${emoji}</span></div>`;
    });
  }
  box.style.display = "block";
}
function hideHistory() { document.getElementById("historyBox").style.display = "none"; }
function clearHistory() { localStorage.removeItem("interviewHistory"); showHistory(); alert("History cleared successfully!"); }

// 7. PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}