// main.js (type="module")

/* ---------------- Login Logic ---------------- */
const loginScreen = document.getElementById("loginScreen");
const appDiv = document.getElementById("app");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginStatus = document.getElementById("loginStatus");

const MASTER_PASSWORD = "30730530";

loginBtn.addEventListener("click", () => {
  if (passwordInput.value === MASTER_PASSWORD) {
    loginScreen.classList.add("hidden");
    appDiv.classList.remove("hidden");
  } else {
    loginStatus.textContent = "كلمة المرور غير صحيحة ❌";
  }
});

/* ---------------- Firebase Setup ---------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyANAmBZ2ySOP6hcVMZ2zfu8PsnXnHqZbOA",
  authDomain: "amal-recovery.firebaseapp.com",
  projectId: "amal-recovery",
  storageBucket: "amal-recovery.firebasestorage.app",
  messagingSenderId: "1082715046722",
  appId: "1:1082715046722:web:d1a116cc70f2276f513edb",
  measurementId: "G-Z5D7GQ860S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ---------------- Departments ---------------- */
const departments = [
  { id: "administrative", name: "الإداري" },
  { id: "finance", name: "المالي" },
  { id: "media_pr", name: "الإعلام و العلاقات العامة" },
  { id: "psych_support", name: "الدعم النفسي" },
  { id: "medical", name: "الطبي" },
  { id: "projects", name: "المشاريع" },
  { id: "executive", name: "التنفيذي" },
  { id: "rnd", name: "البحث و التطوير" },
  { id: "training", name: "التدريب" },
  { id: "needs", name: "الحوجات" },
  { id: "advisory", name: "الاستشاري" },
];

/* ---------------- DOM ---------------- */
const grid = document.getElementById("departmentsGrid");
const panel = document.getElementById("deptPanel");
const deptTitle = document.getElementById("deptTitle");
const closePanelBtn = document.getElementById("closePanelBtn");

const addMemberForm = document.getElementById("addMemberForm");
const memberName = document.getElementById("memberName");
const memberRole = document.getElementById("memberRole");
const memberPhone = document.getElementById("memberPhone");
const memberLocation = document.getElementById("memberLocation");
const formStatus = document.getElementById("formStatus");

const membersList = document.getElementById("membersList");
const membersEmpty = document.getElementById("membersEmpty");

/* ---------------- Build Departments Grid ---------------- */
function renderDepartments() {
  grid.innerHTML = "";
  departments.forEach((d) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3 class="card-title">${d.name}</h3>`;
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "فتح المكتب";
    btn.addEventListener("click", () => openDepartment(d));
    card.appendChild(btn);
    grid.appendChild(card);
  });
}

/* ---------------- Panel Logic ---------------- */
let currentDept = null;
let unsubscribeMembers = null;

function openDepartment(dept) {
  currentDept = dept;
  deptTitle.textContent = dept.name;
  panel.classList.remove("hidden");
  formStatus.textContent = "";
  addMemberForm.reset();
  startMembersListener(dept.id);
}

function closePanel() {
  panel.classList.add("hidden");
  if (unsubscribeMembers) unsubscribeMembers();
  membersList.innerHTML = "";
  membersEmpty.classList.add("hidden");
}
closePanelBtn.addEventListener("click", closePanel);

/* ---------------- Members Real-time ---------------- */
function startMembersListener(deptId) {
  if (unsubscribeMembers) unsubscribeMembers();
  const q = query(collection(db, "departments", deptId, "members"), orderBy("createdAt", "desc"));
  unsubscribeMembers = onSnapshot(q, (snap) => {
    membersList.innerHTML = "";
    if (snap.empty) {
      membersEmpty.classList.remove("hidden");
      return;
    }
    membersEmpty.classList.add("hidden");
    snap.forEach((doc) => {
      const m = doc.data();
      const li = document.createElement("li");
      li.className = "member";
      li.innerHTML = `
        <p class="member-name">${m.name}</p>
        <p class="member-role">${m.role}</p>
        <div class="member-meta">
          <span>📞 ${m.phone}</span>
          <span>📍 ${m.location}</span>
        </div>
      `;
      membersList.appendChild(li);
    });
  });
}

/* ---------------- Add Member ---------------- */
addMemberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentDept) return;

  const phoneVal = memberPhone.value.trim();
  if (!/^0\d{9}$/.test(phoneVal)) {
    formStatus.textContent = "رقم الهاتف غير صحيح";
    return;
  }

  const payload = {
    name: memberName.value.trim(),
    role: memberRole.value.trim(),
    phone: phoneVal,
    location: memberLocation.value.trim(),
    createdAt: serverTimestamp()
  };

  try {
    formStatus.textContent = "جاري الحفظ...";
    await addDoc(collection(db, "departments", currentDept.id, "members"), payload);
    formStatus.textContent = "تمت الإضافة ✅";
    addMemberForm.reset();
  } catch {
    formStatus.textContent = "خطأ أثناء الحفظ";
  }
});

/* ---------------- Init ---------------- */
renderDepartments();
