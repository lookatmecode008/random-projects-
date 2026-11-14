const findRecordButton = document.getElementById("find-record");
const clockInButton = document.getElementById("clock-in");
const clockOutButton = document.getElementById("clock-out");
const employeeIdInput = document.getElementById("employee-id");
var employeeNameOutput = document.querySelector(".identity-name");
var employeeDepartmentOutput = document.querySelector(".identity-message");


let employeeDatabase = [];
// this app waits for this fucntion run completely before continuing since the CSV mcut load before attendance can be checked.
// we have to wait for the file to be fetched completely first, then wait for its content to be read as text in order for it to be useable. 

fetch("./listOfEmployees.csv")
  .then(response => response.text())
  .then((data) => {
      const rows = data.split(/\r?\n/);
      const headers = rows.shift().split(";");
      return employeeDatabase = rows.map((row) => {
          const values = row.split(";");
          return Object.fromEntries(
            headers.map((header, index) => [
              header.trim(),
              values[index]?.trim() ?? "",
            ]))});
        findRecord()          // atp, the database has ben loaded and read
      })
    
    .catch((error) => console.error(error));

let currentEmployee = null;
let attendanceRegistry =
  JSON.parse(localStorage.getItem("attendanceRegister")) || [];

function getToday() {
  return new Date().toISOString().split("T")[0]; // "2026-05-11"
}

// === CORE LOGIC WITH find() ===
function getClockStatus(employeeId) {
  const today = getToday();

  // 1. Is there an open record for TODAY? (clocked in, not out)
  const openToday = attendanceRegistry.find(
    (r) => r.Id === employeeId && r.date === today && r.clockOut === null,
  );

  // 2. Is there a closed record for TODAY? (already finished today)
  const closedToday = attendanceRegistry.find(
    (r) => r.Id === employeeId && r.date === today && r.clockOut !== null,
  );

  if (openToday) {
    // Clocked in, needs to clock out
    return {
      canIn: false,
      canOut: true,
      message: `Clocked in at ${openToday.clockIn}`,
    };
  }
  if (closedToday) {
    // Already dId a full shift today
    return {
      canIn: false,
      canOut: false,
      message: `Already completed shift today (${closedToday.clockIn} - ${closedToday.clockOut})`,
    };
  }
  // No record today
  return { canIn: true, canOut: false, message: "Ready to clock in" };
}

function updateButtonsAndStatus(employeeId) {
  const status = getClockStatus(employeeId);
  clockInButton.disabled = !status.canIn;
  clockOutButton.disabled = !status.canOut;
  document.querySelector(".state-description").textContent = status.message;
  return status;
}


function findRecord() {
   //console.log(employeeDatabase)
  const employeeId = employeeIdInput.value.trim();
  const foundEmployee = employeeDatabase.find(
    (record) => record.Id === employeeId,
  );

  if (foundEmployee) {
    currentEmployee = foundEmployee;
    employeeNameOutput.textContent = `Name: ${foundEmployee.Name}`;
    employeeDepartmentOutput.textContent = `Department: ${foundEmployee.Department}`;
    document.querySelector(".state-title").textContent =
      "Employee Record Found";

    updateButtonsAndStatus(foundEmployee.Id);
    localStorage.setItem("foundID", JSON.stringify(foundEmployee.Id));
    return foundEmployee;
  } else {
    alert("Employee record not found.");
    return null;
  }
}

function clockIn() {
  if (!currentEmployee) currentEmployee = findRecord();
  if (!currentEmployee) return;

  const status = getClockStatus(currentEmployee.Id);
  if (!status.canIn) {
    alert(status.message);
    return;
  }

  attendanceRegistry.push({
    Id: currentEmployee.Id,
    name: currentEmployee.Name,
    department: currentEmployee.Department,
    date: getToday(),
    clockIn: new Date().toLocaleTimeString(),
    clockOut: null,
  });

  localStorage.setItem(
    "attendanceRegister",
    JSON.stringify(attendanceRegistry),
  );
  updateButtonsAndStatus(currentEmployee.Id);
}

function clockOut() {
  if (!currentEmployee) return;
  const today = getToday();

  // find() the open record for TODAY to close it
  const recordToClose = attendanceRegistry.find(
    (r) =>
      r.Id === currentEmployee.Id && r.date === today && r.clockOut === null,
  );

  if (!recordToClose) {
    alert("No open clock-in found for today");
    return;
  }

  recordToClose.clockOut = new Date().toLocaleTimeString();
  localStorage.setItem(
    "attendanceRegister",
    JSON.stringify(attendanceRegistry),
  );
  updateButtonsAndStatus(currentEmployee.Id);
}

findRecordButton.addEventListener("click", findRecord);
clockInButton.addEventListener("click", clockIn);
clockOutButton.addEventListener("click", clockOut);

// If you type a new ID, re-check status
// employeeIdInput.addEventListener("input", () => {
//   if (employeeIdInput.value.trim().length === 5) {
//     findRecord();
//   }
// });
