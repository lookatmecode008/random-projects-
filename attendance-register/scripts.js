const findRecordButton = document.getElementById("find-record");
const clockInButton = document.getElementById("clock-in");
const clockOutButton = document.getElementById("clock-out");
const employeeIdInput = document.getElementById("employee-id");
var employeeNameOutput = document.querySelector(".identity-name");
var employeeDepartmentOutput = document.querySelector(".identity-message");

fetch("./listOfEmployees.csv")
  .then(response =>response.text())
  .then(data =>{
  const rows = data.split("\n");
  const headers = rows[0].split(";")
  const headerPairs = headers.map((header,index)=>{return [header, rows [index]]})
  console.log(headerPairs)})
  .catch(error =>console.error(error))


const employeeDatabase = [];

let currentEmployee = null;
let attendanceRegistry = JSON.parse(localStorage.getItem("attendanceRegister")) || [];

function getToday() {
  return new Date().toISOString().split('T')[0]; // "2026-05-11"
}

// === CORE LOGIC WITH find() ===
function getClockStatus(employeeId) {
  const today = getToday();

  // 1. Is there an open record for TODAY? (clocked in, not out)
  const openToday = attendanceRegistry.find(
    r => r.id === employeeId && r.date === today && r.clockOut === null
  );

  // 2. Is there a closed record for TODAY? (already finished today)
  const closedToday = attendanceRegistry.find(
    r => r.id === employeeId && r.date === today && r.clockOut !== null
  );

  if (openToday) {
    // Clocked in, needs to clock out
    return { canIn: false, canOut: true, message: `Clocked in at ${openToday.clockIn}` };
  }
  if (closedToday) {
    // Already did a full shift today
    return { canIn: false, canOut: false, message: `Already completed shift today (${closedToday.clockIn} - ${closedToday.clockOut})` };
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
  const employeeId = employeeIdInput.value.trim();
  const foundEmployee = employeeDatabase.find(record => record.id === employeeId);

  if (foundEmployee) {
    currentEmployee = foundEmployee;
    employeeNameOutput.textContent = `Name: ${foundEmployee.name} ${foundEmployee.surname}`;
    employeeDepartmentOutput.textContent = `Department: ${foundEmployee.department}`;
    document.querySelector(".state-title").textContent = "Employee Record Found";
    
    updateButtonsAndStatus(foundEmployee.id);
    localStorage.setItem("foundID", JSON.stringify(foundEmployee.id));
    return foundEmployee;
  } else {
    alert("Employee record not found.");
    return null;
  }
}

function clockIn() {
  if (!currentEmployee) currentEmployee = findRecord();
  if (!currentEmployee) return;

  const status = getClockStatus(currentEmployee.id);
  if (!status.canIn) {
    alert(status.message);
    return;
  }

  attendanceRegistry.push({
    id: currentEmployee.id,
    name: currentEmployee.name,
    surname: currentEmployee.surname,
    department: currentEmployee.department,
    date: getToday(),
    clockIn: new Date().toLocaleTimeString(),
    clockOut: null
  });

  localStorage.setItem("attendanceRegister", JSON.stringify(attendanceRegistry));
  updateButtonsAndStatus(currentEmployee.id);
}

function clockOut() {
  if (!currentEmployee) return;
  const today = getToday();

  // find() the open record for TODAY to close it
  const recordToClose = attendanceRegistry.find(
    r => r.id === currentEmployee.id && r.date === today && r.clockOut === null
  );

  if (!recordToClose) {
    alert("No open clock-in found for today");
    return;
  }

  recordToClose.clockOut = new Date().toLocaleTimeString();
  localStorage.setItem("attendanceRegister", JSON.stringify(attendanceRegistry));
  updateButtonsAndStatus(currentEmployee.id);
}

findRecordButton.addEventListener("click", findRecord);
clockInButton.addEventListener("click", clockIn);
clockOutButton.addEventListener("click", clockOut);

// If you type a new ID, re-check status
employeeIdInput.addEventListener("input", () => {
  if (employeeIdInput.value.trim().length === 5) {
    findRecord();
  }
});