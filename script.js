const calendar = document.getElementById("calendar");
const selectedDateText = document.getElementById("selected-date");
const todoInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
let selectedDate = null;

let currentYear;
let currentMonth;

// 日付ごとの予定データ
const schedules = {};

// カレンダー生成
function createCalendar() {
  calendar.innerHTML = "";

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  document.getElementById("current-month").textContent =
    `${currentYear}年 ${currentMonth + 1}月`;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr =
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const div = document.createElement("div");
    div.className = "day";
    div.textContent = day;

    div.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
      div.classList.add("selected");

      selectedDate = dateStr;
      selectedDateText.textContent = dateStr;
      renderTodos();
    });

    calendar.appendChild(div);
  }
}

document.getElementById("prev-month").onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  createCalendar();
};

document.getElementById("next-month").onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  createCalendar();
  drawLineChart();

};


// 予定表示
function renderTodos() {
  todoList.innerHTML = "";
  if (!schedules[selectedDate]) return;

  schedules[selectedDate].forEach((item) => {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = item.title;
    if (item.done) {
      title.style.textDecoration = "line-through";
      title.style.color = "#888";
    }

    const memo = document.createElement("div");
    memo.textContent = item.memo;
    memo.style.fontSize = "0.9em";

    const btn = document.createElement("button");
    btn.textContent = item.done ? "未達に戻す" : "達成";
    btn.onclick = () => {
      item.done = !item.done;
      saveSchedules();  

      renderTodos();
      drawLineChart();
    };

    li.appendChild(title);
    li.appendChild(memo);
    li.appendChild(btn);
    todoList.appendChild(li);
  });
}


// 予定追加
const memoInput = document.getElementById("memo-input");

addBtn.addEventListener("click", () => {
  if (!selectedDate) return;
  if (todoInput.value.trim() === "") return;

  if (!schedules[selectedDate]) {
    schedules[selectedDate] = [];
  }

  schedules[selectedDate].push({
    title: todoInput.value,
    memo: memoInput.value,
    done: false
  });
  saveSchedules();


  todoInput.value = "";
  memoInput.value = "";
  renderTodos();
  drawLineChart();
});

function getDailyRates(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rates = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const list = schedules[dateStr];

    if (!list || list.length === 0) {
      rates.push(null); // 予定なし
      continue;
    }

    const doneCount = list.filter(item => item.done).length;
    const rate = (doneCount / list.length) * 100;
    rates.push(rate);
  }

  return rates;
}


function drawLineChart() {
  const canvas = document.getElementById("statusChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rates = getDailyRates(currentYear, currentMonth);
  const padding = 40;
  const graphHeight = canvas.height - padding * 2;
  const graphWidth = canvas.width - padding * 2;
  const stepX = graphWidth / (rates.length - 1);

  // 軸
  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // 折れ線
  ctx.strokeStyle = "#4caf50";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let started = false;

  rates.forEach((rate, i) => {
    if (rate === null) {
      started = false;
      return;
    }

    const x = padding + i * stepX;
    const y = canvas.height - padding - (rate / 100) * graphHeight;

    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}



// 今月を表示
const now = new Date();
currentYear = now.getFullYear();
currentMonth = now.getMonth();
createCalendar();

window.onload = () => {
  schedules = loadSchedules();
  renderCalendar();
};
