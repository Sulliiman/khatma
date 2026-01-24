// 👈 عدّل الرابط هذا فقط
const API = "https://khatma-api.onrender.com";

// جلب الأجزاء
fetch(API + "/juz")
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "juz" + (item.done ? " done" : "");

            // 🟢 مكتمل
            if (item.done) {
                div.innerHTML = `
                <div class="juz-number">الجزء ${item.juz}</div>
                <div class="done-text"> قرأه: ${item.name} ✔️</div>
              `;
            }

            // 🟡 مسجّل
            else if (item.name) {
                div.classList.add("reserved");
                div.innerHTML = `
                <div class="juz-number">الجزء ${item.juz}</div>
                <div class= "reserved-text">صاحب الجزء: ${item.name}</div>
                <button onclick="markDone(${item.juz})">✔️ اضغط هنا إذا أكملت الجزء</button>
              `;
            }

            // ⚪ فاضي
            else {
                div.innerHTML = `
                <div class="juz-number">الجزء ${item.juz}</div>
                <input id="name-${item.juz}" placeholder="اسمك">
                <button onclick="register(${item.juz})">تسجيل الجزء</button>
              `;
            }

            list.appendChild(div);
        });

    })
    .catch(err => {
        alert("فشل الاتصال بالسيرفر");
        console.error(err);
    });


function register(juz) {
    const input = document.getElementById("name-" + juz);
    const name = input.value.trim();

    if (!name) {
        alert("اكتب اسمك");
        return;
    }

    fetch(API + "/juz/" + juz + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            alert("تم تسجيل الجزء بنجاح ");
            location.reload();
        })
        .catch(() => {
            alert("الجزء مسجل مسبقًا");
        });
}

fetch(API + "/stats")
  .then(res => res.json())
  .then(data => {
    document.getElementById("counter").innerText =
      `عدد الختمات: ${data.count}`;
  });


// تعليم الجزء كمقروء
function markDone(juz) {
    const ok = confirm(`هل أنت متأكد من إكمال الجزء رقم ${juz}؟`);
    if (!ok) return; 
    
    fetch(API + "/juz/" + juz, {
        method: "POST"
    })
        .then(res => {
            if (!res.ok) throw new Error();
            location.reload();
        })
        .catch(() => {
            alert("لا يمكن الإكمال");
        });
}

function resetAll() {
    const pass = prompt("أدخل كلمة المرور :");
    if (pass !== "alhasan") {
        alert("غير مصرح ❌");
        return;
    }

    if (!confirm("هل أنت متأكد؟ سيتم تصفير جميع الأجزاء")) return;

    fetch(API + "/reset", {
        method: "POST"
    })
    .then(() => location.reload())
    .catch(() => alert("فشل التصفير"));
}

