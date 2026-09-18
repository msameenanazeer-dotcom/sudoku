const originalBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],

    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],

    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

let board = copyBoard(originalBoard);
let solvingSteps = [];
let currentStep = 0;


// ===============================
// Copy Board
// ===============================

function copyBoard(board) {
    return board.map(row => [...row]);
}


// ===============================
// Create Sudoku Grid
// ===============================

function createGrid() {

    const grid = document.getElementById("sudoku-grid");

    grid.innerHTML = "";

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const cell = document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const value = board[row][col];

            if (value !== 0) {

                cell.textContent = value;

                if (originalBoard[row][col] !== 0) {
                    cell.classList.add("given");
                }
            }

            cell.addEventListener("click", function () {
                selectCell(row, col);
            });

            grid.appendChild(cell);
        }
    }
}


// ===============================
// Select Cell
// ===============================

function selectCell(row, col) {

    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("selected");
    });

    const index = row * 9 + col;

    const cells = document.querySelectorAll(".cell");

    if (cells[index]) {
        cells[index].classList.add("selected");
    }

    showCandidates(row, col);
}


// ===============================
// Show Candidates
// ===============================

function showCandidates(row, col) {

    const display =
        document.getElementById("candidate-display");

    if (board[row][col] !== 0) {

        display.innerHTML =
            `<strong>Cell (${row + 1}, ${col + 1})</strong>
             <br>Current value: ${board[row][col]}`;

        return;
    }

    const candidates =
        getCandidates(board, row, col);

    if (candidates.length === 0) {

        display.innerHTML =
            `<strong>Cell (${row + 1}, ${col + 1})</strong>
             <br><span style="color:red">
             No candidates
             </span>`;

        return;
    }

    let html =
        `<strong>Cell (${row + 1}, ${col + 1})</strong>
         <br>Possible values:<br>`;

    candidates.forEach(number => {

        html +=
            `<span class="candidate">${number}</span>`;
    });

    display.innerHTML = html;
}


// ===============================
// Check Valid Number
// ===============================

function isValid(board, row, col, number) {

    // Row
    for (let c = 0; c < 9; c++) {

        if (board[row][c] === number) {
            return false;
        }
    }

    // Column
    for (let r = 0; r < 9; r++) {

        if (board[r][col] === number) {
            return false;
        }
    }

    // 3 × 3 box
    const startRow =
        Math.floor(row / 3) * 3;

    const startCol =
        Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {

        for (let c = startCol; c < startCol + 3; c++) {

            if (board[r][c] === number) {
                return false;
            }
        }
    }

    return true;
}


// ===============================
// Get Candidates
// ===============================

function getCandidates(board, row, col) {

    const candidates = [];

    for (let number = 1; number <= 9; number++) {

        if (isValid(board, row, col, number)) {
            candidates.push(number);
        }
    }

    return candidates;
}


// ===============================
// Find Empty Cell
// ===============================

function findEmpty(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }

    return null;
}


// ===============================
// Add Step
// ===============================

function addStep(type, message, row, col, value) {

    solvingSteps.push({
        type: type,
        message: message,
        row: row,
        col: col,
        value: value
    });
}


// ===============================
// Naked Single
// ===============================

function applyNakedSingle(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {

                const candidates =
                    getCandidates(board, row, col);

                if (candidates.length === 1) {

                    const value = candidates[0];

                    board[row][col] = value;

                    addStep(
                        "naked",
                        `Naked Single: Row ${row + 1}, Column ${col + 1} = ${value}`,
                        row,
                        col,
                        value
                    );

                    return true;
                }
            }
        }
    }

    return false;
}


// ===============================
// Hidden Single
// ===============================

function applyHiddenSingle(board) {

    // ROWS
    for (let row = 0; row < 9; row++) {

        for (let number = 1; number <= 9; number++) {

            const locations = [];

            for (let col = 0; col < 9; col++) {

                if (
                    board[row][col] === 0 &&
                    getCandidates(board, row, col)
                        .includes(number)
                ) {
                    locations.push([row, col]);
                }
            }

            if (locations.length === 1) {

                const [r, c] = locations[0];

                board[r][c] = number;

                addStep(
                    "hidden",
                    `Hidden Single: ${number} can only go in Row ${r + 1}, Column ${c + 1}`,
                    r,
                    c,
                    number
                );

                return true;
            }
        }
    }


    // COLUMNS
    for (let col = 0; col < 9; col++) {

        for (let number = 1; number <= 9; number++) {

            const locations = [];

            for (let row = 0; row < 9; row++) {

                if (
                    board[row][col] === 0 &&
                    getCandidates(board, row, col)
                        .includes(number)
                ) {
                    locations.push([row, col]);
                }
            }

            if (locations.length === 1) {

                const [r, c] = locations[0];

                board[r][c] = number;

                addStep(
                    "hidden",
                    `Hidden Single: ${number} can only go in Row ${r + 1}, Column ${c + 1}`,
                    r,
                    c,
                    number
                );

                return true;
            }
        }
    }


    // BOXES
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {

        for (let boxCol = 0; boxCol < 9; boxCol += 3) {

            for (let number = 1; number <= 9; number++) {

                const locations = [];

                for (
                    let row = boxRow;
                    row < boxRow + 3;
                    row++
                ) {

                    for (
                        let col = boxCol;
                        col < boxCol + 3;
                        col++
                    ) {

                        if (
                            board[row][col] === 0 &&
                            getCandidates(board, row, col)
                                .includes(number)
                        ) {
                            locations.push([row, col]);
                        }
                    }
                }

                if (locations.length === 1) {

                    const [r, c] = locations[0];

                    board[r][c] = number;

                    addStep(
                        "hidden",
                        `Hidden Single: ${number} found in 3×3 box at Row ${r + 1}, Column ${c + 1}`,
                        r,
                        c,
                        number
                    );

                    return true;
                }
            }
        }
    }

    return false;
}


// ===============================
// Constraint Propagation
// ===============================

function constraintPropagation(board) {

    while (true) {

        if (applyNakedSingle(board)) {
            continue;
        }

        if (applyHiddenSingle(board)) {
            continue;
        }

        break;
    }
}


// ===============================
// Backtracking
// ===============================

function solve(board) {

    constraintPropagation(board);

    const empty = findEmpty(board);

    if (empty === null) {
        return true;
    }

    const [row, col] = empty;

    const candidates =
        getCandidates(board, row, col);

    for (const number of candidates) {

        board[row][col] = number;

        addStep(
            "backtrack",
            `Backtracking: Trying ${number} at Row ${row + 1}, Column ${col + 1}`,
            row,
            col,
            number
        );

        if (solve(board)) {
            return true;
        }

        board[row][col] = 0;

        addStep(
            "backtrack",
            `Backtracking: Undo ${number} at Row ${row + 1}, Column ${col + 1}`,
            row,
            col,
            0
        );
    }

    return false;
}


// ===============================
// Update Grid
// ===============================

function updateGrid() {

    const cells =
        document.querySelectorAll(".cell");

    cells.forEach(cell => {

        const row =
            Number(cell.dataset.row);

        const col =
            Number(cell.dataset.col);

        cell.textContent = "";

        cell.classList.remove(
            "solved",
            "current"
        );

        if (board[row][col] !== 0) {

            cell.textContent =
                board[row][col];

            if (originalBoard[row][col] === 0) {

                cell.classList.add("solved");
            }
        }
    });
}


// ===============================
// Display Steps
// ===============================

function displaySteps() {

    const container =
        document.getElementById("steps");

    container.innerHTML = "";

    solvingSteps.forEach((step, index) => {

        const div =
            document.createElement("div");

        div.className =
            `step-item ${step.type}`;

        div.innerHTML =
            `<strong>Step ${index + 1}</strong><br>
             ${step.message}`;

        container.appendChild(div);
    });
}


// ===============================
// Solve Button
// ===============================

document
    .getElementById("solveBtn")
    .addEventListener("click", function () {

        board =
            copyBoard(originalBoard);

        solvingSteps = [];

        currentStep = 0;

        const solutionBoard =
            copyBoard(originalBoard);

        const solved =
            solve(solutionBoard);

        if (!solved) {

            alert("No solution exists.");

            return;
        }

        board =
            copyBoard(solutionBoard);

        updateGrid();

        displaySteps();

        document
            .querySelectorAll(".algorithm-step")
            .forEach(step => {

                step.classList.remove("active");

            });

        document
            .querySelector(".algorithm-step")
            .classList.add("completed");
    });


// ===============================
// Next Step
// ===============================

document
    .getElementById("stepBtn")
    .addEventListener("click", function () {

        if (solvingSteps.length === 0) {

            const tempBoard =
                copyBoard(originalBoard);

            solvingSteps = [];

            solve(tempBoard);

            board =
                copyBoard(originalBoard);

            currentStep = 0;

            displaySteps();
        }

        if (currentStep < solvingSteps.length) {

            const step =
                solvingSteps[currentStep];

            if (step.value !== 0) {

                board[step.row][step.col] =
                    step.value;
            }

            currentStep++;

            updateGrid();

            const cells =
                document.querySelectorAll(".cell");

            cells.forEach(cell => {
                cell.classList.remove("current");
            });

            const index =
                step.row * 9 + step.col;

            if (cells[index]) {
                cells[index].classList.add("current");
            }
        }
    });


// ===============================
// Reset
// ===============================

document
    .getElementById("resetBtn")
    .addEventListener("click", function () {

        board =
            copyBoard(originalBoard);

        solvingSteps = [];

        currentStep = 0;

        createGrid();

        document.getElementById("candidate-display")
            .innerHTML = "Select a cell";

        document.getElementById("steps")
            .innerHTML =
            `<p class="empty-message">
                Press <b>Solve Sudoku</b> to see
                the solving process.
            </p>`;
    });


// ===============================
// Clear
// ===============================

document
    .getElementById("clearBtn")
    .addEventListener("click", function () {

        board =
            Array.from(
                { length: 9 },
                () => Array(9).fill(0)
            );

        solvingSteps = [];

        currentStep = 0;

        createGrid();

        document.getElementById("steps")
            .innerHTML =
            `<p class="empty-message">
                Board cleared.
            </p>`;
    });


// ===============================
// Start Website
// ===============================

createGrid();
