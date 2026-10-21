const STORAGE_KEY = "northstar-ums-people-v1";
const initialUsers = [
  { id: "u-01", name: "Sophie Chen", email: "sophie.chen@northstar.co", role: "Designer", team: "Design", status: "Active", lastSeen: "Just now", initials: "SC", color: "peach" },
  { id: "u-02", name: "Marcus Johnson", email: "marcus.j@northstar.co", role: "Developer", team: "Engineering", status: "Active", lastSeen: "12 min ago", initials: "MJ", color: "blue" },
  { id: "u-03", name: "Priya Patel", email: "priya.patel@northstar.co", role: "Product manager", team: "Product", status: "Active", lastSeen: "34 min ago", initials: "PP", color: "lavender" },
  { id: "u-04", name: "Oliver Brooks", email: "oliver.b@northstar.co", role: "Marketing", team: "Marketing", status: "Pending", lastSeen: "Invited yesterday", initials: "OB", color: "green" },
  { id: "u-05", name: "Amara Okafor", email: "amara.o@northstar.co", role: "Developer", team: "Engineering", status: "Active", lastSeen: "2 hours ago", initials: "AO", color: "rose" },
  { id: "u-06", name: "Ethan Williams", email: "ethan.w@northstar.co", role: "Designer", team: "Design", status: "Inactive", lastSeen: "3 days ago", initials: "EW", color: "yellow" },
  { id: "u-07", name: "Isabella Rossi", email: "isabella.r@northstar.co", role: "Admin", team: "Product", status: "Active", lastSeen: "Yesterday", initials: "IR", color: "mint" },
];

const byId = (id) => document.getElementById(id);
const tableBody = byId("people-table-body");
const searchInput = byId("search-input");
const roleFilter = byId("role-filter");
const statusFilter = byId("status-filter");
const dialog = byId("user-dialog");
const form = byId("user-form");
const formError = byId("form-error");
const toast = byId("toast");
let users = loadUsers();
let toastTimeout;

function loadUsers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialUsers.map((user) => ({ ...user }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isValidUser)) throw new Error("Saved people data has an unexpected format.");
    return parsed;
  } catch (error) {
    console.error("Could not load saved people data.", error);
    return initialUsers.map((user) => ({ ...user }));
  }
}

function isValidUser(user) {
  return user && typeof user.id === "string" && typeof user.name === "string" &&
    typeof user.email === "string" && typeof user.role === "string" &&
    typeof user.team === "string" && ["Active", "Pending", "Inactive"].includes(user.status);
}

function saveUsers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Could not save people data.", error);
    showToast("Changes couldn’t be saved in this browser.");
  }
}

function initialsFor(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function teamClass(team) {
  const teamClasses = {
    Design: "team-design",
    Engineering: "team-engineering",
    Product: "team-product",
    Marketing: "team-marketing",
  };
  return teamClasses[team] ?? "team-product";
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const role = roleFilter.value;
  const status = statusFilter.value;
  const visibleUsers = users.filter((user) => {
    const matchesQuery = [user.name, user.email, user.role, user.team].some((value) => value.toLowerCase().includes(query));
    return matchesQuery && (role === "all" || user.role === role) && (status === "all" || user.status === status);
  });

  tableBody.innerHTML = visibleUsers.map((user) => `
    <tr>
      <td>
        <div class="person-cell">
          <span class="avatar avatar-${escapeHtml(user.color)}" aria-hidden="true">${escapeHtml(user.initials)}</span>
          <span class="person-info"><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span></span>
        </div>
      </td>
      <td><span class="role-chip">${escapeHtml(user.role)}</span></td>
      <td><span class="team-cell"><span class="team-mark ${teamClass(user.team)}" aria-hidden="true">${escapeHtml(user.team[0])}</span>${escapeHtml(user.team)}</span></td>
      <td><span class="status-badge status-${user.status.toLowerCase()}">${escapeHtml(user.status)}</span></td>
      <td><span class="last-seen">${escapeHtml(user.lastSeen)}</span></td>
      <td>
        <div class="row-menu-wrap">
          <button class="row-menu-button" type="button" aria-label="Actions for ${escapeHtml(user.name)}" aria-expanded="false" data-menu="${escapeHtml(user.id)}">···</button>
          <div class="row-menu" data-menu-content="${escapeHtml(user.id)}" hidden>
            ${user.status === "Pending" ? `<button type="button" data-action="resend" data-user-id="${escapeHtml(user.id)}">Resend invitation</button>` : `<button type="button" data-action="toggle" data-user-id="${escapeHtml(user.id)}">${user.status === "Inactive" ? "Reactivate person" : "Deactivate person"}</button>`}
            <button class="delete-action" type="button" data-action="remove" data-user-id="${escapeHtml(user.id)}">Remove from workspace</button>
          </div>
        </div>
      </td>
    </tr>`).join("");

  byId("empty-state").hidden = visibleUsers.length > 0;
  tableBody.hidden = visibleUsers.length === 0;
  const activeCount = users.filter((user) => user.status === "Active").length;
  const pendingCount = users.filter((user) => user.status === "Pending").length;
  byId("total-users").textContent = users.length;
  byId("active-users").textContent = activeCount;
  byId("pending-users").textContent = pendingCount;
  byId("nav-count").textContent = users.length;
  byId("directory-count").textContent = visibleUsers.length;
  byId("active-progress").style.width = users.length ? `${(activeCount / users.length) * 100}%` : "0";
  byId("table-summary").textContent = visibleUsers.length === users.length
    ? `Showing all ${users.length} ${users.length === 1 ? "person" : "people"}`
    : `Showing ${visibleUsers.length} of ${users.length} people`;
}

function openDialog() {
  form.reset();
  formError.hidden = true;
  formError.textContent = "";
  dialog.showModal();
  form.elements.name.focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2900);
}

function handleTableAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const user = users.find((person) => person.id === button.dataset.userId);
  if (!user) return;

  if (button.dataset.action === "resend") {
    user.lastSeen = "Invitation resent just now";
    saveUsers();
    render();
    showToast(`Invitation resent to ${user.email}`);
  } else if (button.dataset.action === "toggle") {
    user.status = user.status === "Inactive" ? "Active" : "Inactive";
    saveUsers();
    render();
    showToast(`${user.name} is now ${user.status.toLowerCase()}.`);
  } else if (button.dataset.action === "remove") {
    users = users.filter((person) => person.id !== user.id);
    saveUsers();
    render();
    showToast(`${user.name} was removed from your workspace.`);
  }
}

byId("add-user-button").addEventListener("click", openDialog);
byId("invite-button").addEventListener("click", openDialog);
byId("empty-add-button").addEventListener("click", openDialog);
byId("dialog-close").addEventListener("click", () => dialog.close());
byId("cancel-button").addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", render);
roleFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);
tableBody.addEventListener("click", handleTableAction);

tableBody.addEventListener("click", (event) => {
  const menuButton = event.target.closest("[data-menu]");
  if (!menuButton) return;
  const menu = tableBody.querySelector(`[data-menu-content="${CSS.escape(menuButton.dataset.menu)}"]`);
  const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
  tableBody.querySelectorAll("[data-menu-content]").forEach((item) => { item.hidden = true; });
  tableBody.querySelectorAll("[data-menu]").forEach((item) => item.setAttribute("aria-expanded", "false"));
  if (!wasOpen && menu) {
    menu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".row-menu-wrap")) {
    tableBody.querySelectorAll("[data-menu-content]").forEach((item) => { item.hidden = true; });
    tableBody.querySelectorAll("[data-menu]").forEach((item) => item.setAttribute("aria-expanded", "false"));
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(form);
  const name = String(values.get("name")).trim();
  const email = String(values.get("email")).trim().toLowerCase();
  if (users.some((user) => user.email.toLowerCase() === email)) {
    formError.textContent = "Someone with that email is already in your workspace.";
    formError.hidden = false;
    form.elements.email.focus();
    return;
  }

  const team = String(values.get("team"));
  users.unshift({
    id: globalThis.crypto?.randomUUID?.() ?? `u-${Date.now()}`,
    name,
    email,
    role: String(values.get("role")),
    team,
    status: "Pending",
    lastSeen: "Invited just now",
    initials: initialsFor(name),
    color: ["peach", "blue", "lavender", "green", "rose", "yellow", "mint"][Math.floor(Math.random() * 7)],
  });
  saveUsers();
  render();
  dialog.close();
  showToast(`Invitation sent to ${email}`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog.open) dialog.close();
});

render();
