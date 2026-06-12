const form = document.querySelector("#sms-form");
const phoneInput = document.querySelector("#phone");
const messageInput = document.querySelector("#message");
const counter = document.querySelector("#counter");
const statusText = document.querySelector("#status");
const historyList = document.querySelector("#history");
const clearHistoryButton = document.querySelector("#clear-history");

const STORAGE_KEY = "minimal-sms-history";
const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.className = type;
}

function updateCounter() {
  counter.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;
}

function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<li class="history__empty">暂无发送记录</li>';
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
        <li class="history__item">
          <div class="history__top">
            <span class="history__phone">${escapeHtml(item.phone)}</span>
            <time datetime="${item.createdAt}">${new Date(item.createdAt).toLocaleString("zh-CN")}</time>
          </div>
          <p class="history__message">${escapeHtml(item.message)}</p>
        </li>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const phone = phoneInput.value.trim();
  const message = messageInput.value.trim();

  if (!PHONE_PATTERN.test(phone)) {
    setStatus("请输入有效手机号", "error");
    phoneInput.focus();
    return;
  }

  if (message.length === 0) {
    setStatus("短信内容不能为空", "error");
    messageInput.focus();
    return;
  }

  const nextHistory = [
    {
      id: crypto.randomUUID(),
      phone,
      message,
      createdAt: new Date().toISOString(),
    },
    ...getHistory(),
  ].slice(0, 10);

  saveHistory(nextHistory);
  form.reset();
  updateCounter();
  setStatus("发送成功（模拟）", "success");
  renderHistory();
});

messageInput.addEventListener("input", updateCounter);

clearHistoryButton.addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
  setStatus("发送记录已清空", "success");
});

updateCounter();
renderHistory();
