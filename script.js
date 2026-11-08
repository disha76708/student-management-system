
"use strict";

// ========================================
// STUDENT MANAGEMENT SYSTEM
// ========================================

// HTML elements

const $ = (id) => document.getElementById(id);

const studentForm = $("studentForm");
const studentModal = $("studentModal");

const studentName = $("studentName");
const studentRoll = $("studentRoll");
const studentEmail = $("studentEmail");
const studentCourse = $("studentCourse");
const studentMarks = $("studentMarks");
const studentId = $("studentId");

const studentTable = $("studentTable");
const recentTable = $("recentTable");
const reportTable = $("reportTable");

const searchInput = $("searchInput");
const courseFilter = $("courseFilter");
const statusFilter = $("statusFilter");
const sortFilter = $("sortFilter");

const saveBtn = $("saveBtn");
const modalTitle = $("modalTitle");


// ========================================
// DATA
// ========================================

// Change this to false if you want a completely
// empty database on the first project launch.

const DEMO_MODE = true;

const demoStudents = [
    {
        id: 101,
        name: "Aarav Sharma",
        roll: "CSE101",
        email: "aarav@example.com",
        course: "B.Tech CSE",
        marks: 88
    },
    {
        id: 102,
        name: "Priya Singh",
        roll: "CSE102",
        email: "priya@example.com",
        course: "B.Tech CSE",
        marks: 92
    },
    {
        id: 103,
        name: "Rahul Verma",
        roll: "BCA103",
        email: "rahul@example.com",
        course: "BCA",
        marks: 76
    },
    {
        id: 104,
        name: "Simran Kaur",
        roll: "BBA104",
        email: "simran@example.com",
        course: "BBA",
        marks: 84
    },
    {
        id: 105,
        name: "Manav Gupta",
        roll: "IT105",
        email: "manav@example.com",
        course: "B.Tech IT",
        marks: 35
    }
];

const STORAGE_KEY = "studentHubRecords_v1";

let students = loadStudents();


// ========================================
// STORAGE
// ========================================

function loadStudents() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {

            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }

        }

    } catch (error) {

        console.error("Could not load student records:", error);

    }

    return DEMO_MODE ? [...demoStudents] : [];

}


function saveStudents() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(students)
        );

        return true;

    } catch (error) {

        console.error("Could not save records:", error);

        showToast("Could not save data. Check browser storage.");

        return false;

    }

}


// ========================================
// HELPERS
// ========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


function getInitials(name) {

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join("");

}


function getStatus(marks) {

    return Number(marks) >= 40 ? "Pass" : "Fail";

}


function formatAverage(value) {

    return Number(value.toFixed(1)) + "%";

}


function showToast(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


function getCourseNames() {

    return [...new Set(
        students.map(student => student.course)
    )].sort();

}


// ========================================
// NAVIGATION
// ========================================

const pages = {
    dashboard: $("dashboardPage"),
    students: $("studentsPage"),
    reports: $("reportsPage")
};


const pageTitles = {
    dashboard: "Dashboard",
    students: "Students",
    reports: "Reports"
};


function navigateTo(pageName) {

    if (!pages[pageName]) return;

    Object.values(pages).forEach(function(page) {

        page.classList.add("hidden");

    });

    pages[pageName].classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(function(button) {

        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );

    });

    $("pageTitle").textContent = pageTitles[pageName];

    if (pageName === "students") {
        renderStudents();
    }

    if (pageName === "reports") {
        renderReports();
    }

}


document.querySelectorAll(".nav-item").forEach(function(button) {

    button.addEventListener("click", function() {

        navigateTo(button.dataset.page);

    });

});


$("viewAllBtn").addEventListener("click", function() {

    navigateTo("students");

});


$("topAddBtn").addEventListener("click", openAddModal);

$("addStudentBtn").addEventListener("click", openAddModal);


// ========================================
// MODAL
// ========================================

function openAddModal() {

    studentForm.reset();

    studentId.value = "";

    modalTitle.textContent = "Add New Student";

    saveBtn.textContent = "Save Student";

    studentModal.classList.remove("hidden");

    studentName.focus();

}


function closeModal() {

    studentModal.classList.add("hidden");

    studentForm.reset();

    studentId.value = "";

}


$("closeModal").addEventListener("click", closeModal);

$("cancelModal").addEventListener("click", closeModal);


studentModal.addEventListener("click", function(event) {

    if (event.target === studentModal) {

        closeModal();

    }

});


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeModal();

    }

});


// ========================================
// ADD / UPDATE STUDENT
// ========================================

studentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = studentName.value.trim();

    const roll = studentRoll.value.trim();

    const email = studentEmail.value.trim();

    const course = studentCourse.value;

    const marks = Number(studentMarks.value);

    const editingId = studentId.value;


    // Validate name

    if (!name || !roll || !email || !course) {

        showToast("Please fill all required fields.");

        return;

    }


    // Validate marks

    if (
        studentMarks.value.trim() === "" ||
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > 100
    ) {

        showToast("Marks must be between 0 and 100.");

        return;

    }


    // Check duplicate roll number

    const duplicate = students.some(function(student) {

        return student.roll.toLowerCase() === roll.toLowerCase()
            && String(student.id) !== editingId;

    });


    if (duplicate) {

        showToast("This roll number already exists.");

        return;

    }


    // Check duplicate email

    const duplicateEmail = students.some(function(student) {

        return student.email.toLowerCase() === email.toLowerCase()
            && String(student.id) !== editingId;

    });


    if (duplicateEmail) {

        showToast("This email already exists.");

        return;

    }


    // Update student

    if (editingId) {

        const index = students.findIndex(function(student) {

            return String(student.id) === editingId;

        });

        if (index === -1) {

            showToast("Student record not found.");

            return;

        }

        students[index] = {
            ...students[index],
            name,
            roll,
            email,
            course,
            marks
        };

        showToast("Student updated successfully!");

    }

    // Add student

    else {

        const newStudent = {

            id: Date.now(),

            name,
            roll,
            email,
            course,
            marks

        };

        students.unshift(newStudent);

        showToast("Student added successfully!");

    }


    const saved = saveStudents();

    if (!saved) return;

    closeModal();

    refreshAll();

});


// ========================================
// EDIT STUDENT
// ========================================

function editStudent(id) {

    const student = students.find(function(student) {

        return String(student.id) === String(id);

    });

    if (!student) {

        showToast("Student not found.");

        return;

    }

    studentId.value = student.id;

    studentName.value = student.name;

    studentRoll.value = student.roll;

    studentEmail.value = student.email;

    studentCourse.value = student.course;

    studentMarks.value = student.marks;

    modalTitle.textContent = "Edit Student";

    saveBtn.textContent = "Update Student";

    studentModal.classList.remove("hidden");

    studentName.focus();

}


// ========================================
// DELETE STUDENT
// ========================================

function deleteStudent(id) {

    const student = students.find(function(student) {

        return String(student.id) === String(id);

    });

    if (!student) return;

    const confirmed = confirm(
        "Delete " + student.name + " permanently?"
    );

    if (!confirmed) return;

    students = students.filter(function(student) {

        return String(student.id) !== String(id);

    });

    if (!saveStudents()) return;

    showToast("Student deleted successfully!");

    refreshAll();

}


// ========================================
// STUDENT TABLE
// ========================================

function createStudentRow(student, includeActions = true) {

    const status = getStatus(student.marks);

    const row = document.createElement("tr");

    const actionHTML = includeActions
        ? `
            <td>
                <div class="actions">
                    <button
                        class="action-btn edit"
                        data-action="edit"
                        data-id="${student.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="action-btn delete"
                        data-action="delete"
                        data-id="${student.id}"
                    >
                        Delete
                    </button>
                </div>
            </td>
        `
        : "";


    row.innerHTML = `
        <td>
            <div class="student-cell">

                <div class="student-avatar">
                    ${escapeHTML(getInitials(student.name))}
                </div>

                <div class="student-info">

                    <strong>${escapeHTML(student.name)}</strong>

                    <small>${escapeHTML(student.email)}</small>

                </div>

            </div>
        </td>

        <td>${escapeHTML(student.roll)}</td>

        <td>${escapeHTML(student.course)}</td>

        <td>${Number(student.marks)}%</td>

        <td>
            <span class="status ${status.toLowerCase()}">
                ${status}
            </span>
        </td>

        ${actionHTML}
    `;

    return row;

}


function renderStudents() {

    const searchText = searchInput.value.trim().toLowerCase();

    const selectedCourse = courseFilter.value;

    const selectedStatus = statusFilter.value;

    const sortOption = sortFilter.value;


    let filtered = students.filter(function(student) {

        const matchesSearch =
            student.name.toLowerCase().includes(searchText) ||
            student.roll.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText);

        const matchesCourse =
            !selectedCourse || student.course === selectedCourse;

        const matchesStatus =
            !selectedStatus || getStatus(student.marks) === selectedStatus;

        return matchesSearch && matchesCourse && matchesStatus;

    });


    // Sorting

    if (sortOption === "name") {

        filtered.sort(function(a, b) {

            return a.name.localeCompare(b.name);

        });

    }

    else if (sortOption === "marks") {

        filtered.sort(function(a, b) {

            return Number(b.marks) - Number(a.marks);

        });

    }

    else if (sortOption === "lowest") {

        filtered.sort(function(a, b) {

            return Number(a.marks) - Number(b.marks);

        });

    }

    else {

        filtered.sort(function(a, b) {

            return Number(b.id) - Number(a.id);

        });

    }


    studentTable.innerHTML = "";

    if (filtered.length === 0) {

        studentTable.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px">
                    No students found.
                </td>
            </tr>
        `;

    }

    else {

        filtered.forEach(function(student) {

            studentTable.appendChild(
                createStudentRow(student, true)
            );

        });

    }


    $("recordInfo").textContent =
        "Showing " + filtered.length + " of " + students.length + " records";


    $("studentCount").textContent = students.length;

    $("studentPassed").textContent = students.filter(function(student) {

        return getStatus(student.marks) === "Pass";

    }).length;

    $("studentFailed").textContent = students.filter(function(student) {

        return getStatus(student.marks) === "Fail";

    }).length;

}


// Table actions

studentTable.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {

        editStudent(id);

    }

    if (button.dataset.action === "delete") {

        deleteStudent(id);

    }

});


// Search and filters

searchInput.addEventListener("input", renderStudents);

courseFilter.addEventListener("change", renderStudents);

statusFilter.addEventListener("change", renderStudents);

sortFilter.addEventListener("change", renderStudents);


// ========================================
// COURSE FILTER
// ========================================

function renderCourseFilter() {

    const selectedValue = courseFilter.value;

    const courses = getCourseNames();

    courseFilter.innerHTML = `
        <option value="">All Courses</option>
    `;

    courses.forEach(function(course) {

        const option = document.createElement("option");

        option.value = course;

        option.textContent = course;

        courseFilter.appendChild(option);

    });

    if (courses.includes(selectedValue)) {

        courseFilter.value = selectedValue;

    }

}


// ========================================
// DASHBOARD
// ========================================

function renderDashboard() {

    const total = students.length;

    const courses = getCourseNames();

    const passed = students.filter(function(student) {

        return getStatus(student.marks) === "Pass";

    }).length;

    const totalMarks = students.reduce(function(sum, student) {

        return sum + Number(student.marks);

    }, 0);

    const average = total ? totalMarks / total : 0;


    $("totalStudents").textContent = total;

    $("totalCourses").textContent = courses.length;

    $("averageMarks").textContent = formatAverage(average);

    $("passedStudents").textContent = passed;


    // Recent students

    recentTable.innerHTML = "";

    const recent = [...students]
        .sort(function(a, b) {

            return Number(b.id) - Number(a.id);

        })
        .slice(0, 5);


    if (recent.length === 0) {

        recentTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px">
                    No students added yet.
                </td>
            </tr>
        `;

    }

    else {

        recent.forEach(function(student) {

            recentTable.appendChild(
                createStudentRow(student, false)
            );

        });

    }


    // Course overview

    const overview = $("courseOverview");

    overview.innerHTML = "";

    courses.forEach(function(course) {

        const count = students.filter(function(student) {

            return student.course === course;

        }).length;

        const percentage = total ? (count / total) * 100 : 0;

        const item = document.createElement("div");

        item.className = "course-item";

        item.innerHTML = `
            <div class="course-item-header">

                <strong>${escapeHTML(course)}</strong>

                <span>${count} students</span>

            </div>

            <div class="progress-track">

                <div
                    class="progress-bar"
                    style="width:${percentage}%"
                ></div>

            </div>
        `;

        overview.appendChild(item);

    });

    if (courses.length === 0) {

        overview.innerHTML = `
            <p>No course data available.</p>
        `;

    }

}


// ========================================
// REPORTS
// ========================================

function renderReports() {

    const total = students.length;

    const passed = students.filter(function(student) {

        return getStatus(student.marks) === "Pass";

    }).length;

    const failed = total - passed;

    const percentage = total ? (passed / total) * 100 : 0;


    $("reportTotal").textContent = total;

    $("reportPassed").textContent = passed;

    $("reportFailed").textContent = failed;

    $("passPercentage").textContent =
        formatAverage(percentage);


    reportTable.innerHTML = "";

    const courses = getCourseNames();

    if (courses.length === 0) {

        reportTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px">
                    No report data available.
                </td>
            </tr>
        `;

        return;

    }


    courses.forEach(function(course) {

        const courseStudents = students.filter(function(student) {

            return student.course === course;

        });

        const courseTotal = courseStudents.length;

        const coursePassed = courseStudents.filter(function(student) {

            return getStatus(student.marks) === "Pass";

        }).length;

        const courseFailed = courseTotal - coursePassed;

        const sumMarks = courseStudents.reduce(function(sum, student) {

            return sum + Number(student.marks);

        }, 0);

        const average = courseTotal ? sumMarks / courseTotal : 0;


        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(course)}</td>
            <td>${courseTotal}</td>
            <td>${formatAverage(average)}</td>
            <td>
                <span class="status pass">${coursePassed}</span>
            </td>
            <td>
                <span class="status fail">${courseFailed}</span>
            </td>
        `;

        reportTable.appendChild(row);

    });

}


// ========================================
// CSV EXPORT
// ========================================

function exportCSV() {

    if (students.length === 0) {

        showToast("No student records to export.");

        return;

    }

    const headers = [
        "Name",
        "Roll Number",
        "Email",
        "Course",
        "Marks",
        "Status"
    ];

    const rows = students.map(function(student) {

        return [
            student.name,
            student.roll,
            student.email,
            student.course,
            student.marks,
            getStatus(student.marks)
        ];

    });


    // Escape CSV values

    function csvEscape(value) {

        let text = String(value ?? "");

        // Prevent spreadsheet formula injection

        if (/^[=+\-@\t\r]/.test(text)) {

            text = "'" + text;

        }

        return '"' + text.replace(/"/g, '""') + '"';

    }


    const csvContent = [headers, ...rows]
        .map(function(row) {

            return row.map(csvEscape).join(",");

        })
        .join("\r\n");


    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "student_records.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully!");

}


$("exportBtn").addEventListener("click", exportCSV);

$("reportExportBtn").addEventListener("click", exportCSV);


// ========================================
// REFRESH EVERYTHING
// ========================================

function refreshAll() {

    renderCourseFilter();

    renderDashboard();

    renderStudents();

    renderReports();

}


// ========================================
// START APPLICATION
// ========================================

refreshAll();

navigateTo("dashboard");
