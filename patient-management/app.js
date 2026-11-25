// Sample data. These records exist only in this browser page.
const patients = [
    {
        number: "DC-0001",
        firstName: "Thabo",
        lastName: "Mokoena",
        age: 31,
        facility: "District Hospital",
        registeredToday: true
    },
    {
        number: "DC-0002",
        firstName: "Sarah",
        lastName: "Dlamini",
        age: 45,
        facility: "Clinic A",
        registeredToday: false
    },
    {
        number: "DC-0003",
        firstName: "James",
        lastName: "Nkosi",
        age: 22,
        facility: "Clinic B",
        registeredToday: true
    }
];

// Find the HTML elements that JavaScript needs to work with.
const tableBody = document.getElementById("patient-table-body");
const searchInput = document.getElementById("search-input");
const totalPatients = document.getElementById("total-patients");
const todayPatients = document.getElementById("today-patients");
const emptyMessage = document.getElementById("empty-message");
const registerPanel = document.getElementById("register-panel");
const patientForm = document.getElementById("patient-form");

// Draw the patient list on the page.
function displayPatients(patientList) {
    // Clear old rows so we don't keep adding duplicates every time we search.
    tableBody.innerHTML = "";

    // Create one table row for each patient.
    patientList.forEach(function (patient) {
        const row = document.createElement("tr");

        // textContent inserts text safely rather than treating it as HTML.
        const numberCell = document.createElement("td");
        numberCell.textContent = patient.number;

        const nameCell = document.createElement("td");
        nameCell.textContent = patient.firstName + " " + patient.lastName;

        const ageCell = document.createElement("td");
        ageCell.textContent = patient.age;

        const facilityCell = document.createElement("td");
        facilityCell.textContent = patient.facility;

        row.append(numberCell, nameCell, ageCell, facilityCell);
        tableBody.appendChild(row);
    });

    // Show a message when the search returns no results.
    emptyMessage.hidden = patientList.length !== 0;
}

// Update the numbers shown in the dashboard.
function updateStatistics() {
    totalPatients.textContent = patients.length;

    const registeredTodayCount = patients.filter(function (patient) {
        return patient.registeredToday;
    }).length;

    todayPatients.textContent = registeredTodayCount;
}

// Search by patient number, first name, or last name.
function searchPatients() {
    const searchText = searchInput.value.toLowerCase();

    const matchingPatients = patients.filter(function (patient) {
        const fullName = patient.firstName + " " + patient.lastName;
        const searchableText = patient.number + " " + fullName;

        return searchableText.toLowerCase().includes(searchText);
    });

    displayPatients(matchingPatients);
}

// Show and hide the registration form.
document.getElementById("show-form-button").addEventListener("click", function () {
    registerPanel.hidden = false;
});

document.getElementById("cancel-button").addEventListener("click", function () {
    registerPanel.hidden = true;
    patientForm.reset();
});

// Run a new search whenever the user types.
searchInput.addEventListener("input", searchPatients);

// Handle form submission.
patientForm.addEventListener("submit", function (event) {
    // Stop the browser from reloading the page when the form is submitted.
    event.preventDefault();

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const age = Number(document.getElementById("age").value);
    const facility = document.getElementById("facility").value;

    // Add a new patient object to our in-memory array.
    const newPatient = {
        number: "DC-" + String(patients.length + 1).padStart(4, "0"),
        firstName: firstName,
        lastName: lastName,
        age: age,
        facility: facility,
        registeredToday: true
    };

    patients.push(newPatient);

    // Refresh the dashboard and clear the form.
    updateStatistics();
    searchInput.value = "";
    searchPatients();
    patientForm.reset();
    registerPanel.hidden = true;
});

// Initial page setup.
updateStatistics();
displayPatients(patients);
