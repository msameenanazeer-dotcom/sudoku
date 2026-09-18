```javascript
/*
=========================================================
 Sudoku Solver
 Constraint Propagation + Backtracking
=========================================================
*/


// -------------------------------------------------------
// Initial Sudoku
// 0 = empty cell
// -------------------------------------------------------

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


// Current working board

let board = copyBoard(originalBoard);


// Solving steps

let solvingSteps = [];

let currentStep = 0;

let solving = false;


// -------------------------------------------------------
// Utility
// -------------------------------------------------------

function copyBoard(board) {

    return board.map(row => [...row]);

}


// -------------------------------------------------------
// Create Sudoku Grid
// -------------------------------------------------------

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

                } else {

                    cell.classList.add("solved");

                }

            }

            cell.addEventListener("click", () => {

                selectCell(row, col);

            });

            grid.appendChild(cell);
        }
    }
}


// -------------------------------------------------------
// Select Cell
// -------------------------------------------------------

function selectCell(row, col) {

    document.querySelectorAll(".cell").forEach(cell => {

        cell.classList.remove("selected");

    });

    const index = row * 9 + col;

    const cell = document.querySelectorAll(".cell")[index];

    cell.classList.add("selected");

    showCandidates(row, col);
}


// -------------------------------------------------------
// Show Candidates
// -------------------------------------------------------

function showCandidates(row, col) {

    const display = document.getElementById("candidate-display");

    if (board[row][col] !== 0) {

        display.innerHTML =
            `<strong>Cell (${row + 1}, ${col + 1})</strong><br>
             Current value: ${board[row][col]}`;

        return;
    }

    const candidates = getCandidates(board, row, col);

    if (candidates.length === 0) {

        display.innerHTML =
            `<strong>Cell (${row + 1}, ${col + 1})</strong>
             <br><span style="color:red">No candidates</span>`;

        return;
    }

    let html =
        `<strong>Cell (${row + 1}, ${col + 1})</strong>
         <br>Possible values:<br>`;

    candidates.forEach(number => {

        html += `<span class="candidate">${number}</span>`;

    });

    display.innerHTML = html;
}


// -------------------------------------------------------
// Check Valid Number
// -------------------------------------------------------

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


    // 3x3 box

    const startRow = Math.floor(row / 3) * 3;

    const startCol = Math.floor(col / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {

        for (let c = startCol; c < startCol + 3; c++) {

            if (board[r][c] === number) {

                return false;
            }
        }
    }

    return true;
}


// -------------------------------------------------------
// Get Candidate Values
// -------------------------------------------------------

function getCandidates(board, row, col) {

    const candidates = [];

    for (let number = 1; number <= 9; number++) {

        if (isValid(board, row, col, number)) {

            candidates.push(number);
        }
    }

    return candidates;
}


// -------------------------------------------------------
// Find Empty Cell
// -------------------------------------------------------

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


// -------------------------------------------------------
// Add Step
// -------------------------------------------------------

function addStep(type, message, row, col, value) {

    solvingSteps.push({

        type: type,

        message: message,

        row: row,

        col: col,

        value: value
    });
}


// -------------------------------------------------------
// Naked Single
// -------------------------------------------------------

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
                        `Naked Single: Cell (${row + 1}, ${col + 1}) can only be ${value}.`,
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


// -------------------------------------------------------
// Hidden Single
// -------------------------------------------------------

function applyHiddenSingle(board) {


    // -------------------------------
    // Rows
    // -------------------------------

    for (let row = 0; row < 9; row++) {

        for (let number = 1; number <= 9; number++) {

            let locations = [];

            for (let col = 0; col < 9; col++) {

                if (
                    board[row][col] === 0 &&
                    getCandidates(board, row, col).includes(number)
                ) {

                    locations.push([row, col]);
                }
            }

            if (locations.length === 1) {

                const [r, c] = locations[0];

                board[r][c] = number;

                addStep(
                    "hidden",
                    `Hidden Single: ${number} can only be placed in Row ${r + 1}, Column ${c + 1}.`,
                    r,
                    c,
                    number
                );

                return true;
            }
        }
    }


    // -------------------------------
    // Columns
    // -------------------------------

    for (let col = 0; col < 9; col++) {

        for (let number = 1; number <= 9; number++) {

            let locations = [];

            for (let row = 0; row < 9; row++) {

                if (
                    board[row][col] === 0 &&
                    getCandidates(board, row, col).includes(number)
                ) {

                    locations.push([row, col]);
                }
            }

            if (locations.length === 1) {

                const [r, c] = locations[0];

                board[r][c] = number;

                addStep(
                    "hidden",
                    `Hidden Single: ${number} can only be placed in Row ${r + 1}, Column ${c + 1}.`,
                    r,
                    c,
                    number
                );

                return true;
            }
        }
    }


    // -------------------------------
    // 3x3 Boxes
    // -------------------------------

    for (let boxRow = 0; boxRow < 9; boxRow += 3) {

        for (let boxCol = 0; boxCol < 9; boxCol += 3) {

            for (let number = 1; number <= 9; number++) {

                let locations = [];

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
                            getCandidates(board, row, col).includes(number)
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
                        `Hidden Single: ${number} has only one position in the 3×3 box containing Row ${r + 1}, Column ${c + 1}.`,
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


// -------------------------------------------------------
// Constraint Propagation
// -------------------------------------------------------

function constraintPropagation(board) {

    while (true) {

        // Naked Single

        if (applyNakedSingle(board)) {

            continue;
        }

        // Hidden Single

        if (applyHiddenSingle(board)) {

            continue;
        }

        break;
    }
}


// -------------------------------------------------------
// Backtracking Solver
// -------------------------------------------------------

function solveWithBacktracking(board) {


    // First apply constraint propagation

    constraintPropagation(board);


    // Check whether solved

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
            `Backtracking: Try ${number} at Row ${row + 1}, Column ${col + 1}.`,
            row,
            col,
            number
        );


        if (solveWithBacktracking(board)) {

            return true;
        }


        board[row][col] = 0;

        addStep(
            "backtrack",
            `Backtracking: ${number} was rejected. Undo Row ${row + 1}, Column ${col + 1}.`,
            row,
            col,
            0
        );
    }


    return false;
}


// -------------------------------------------------------
// Update Grid
// -------------------------------------------------------

function updateGrid() {

    const cells = document.querySelectorAll(".cell");

    cells.forEach(cell => {

        const row = Number(cell.dataset.row);

        const col = Number(cell.dataset.col);

        cell.textContent = "";

        cell.classList.remove(
            "solved",
            "current",
            "error"
        );


        if (board[row][col] !== 0) {

            cell.textContent = board[row][col];

            if (originalBoard[row][col] === 0) {

                cell.classList.add("solved");
            }
        }
    });
}


// -------------------------------------------------------
// Highlight Current Step
// -------------------------------------------------------

function highlightStep(step) {

    const cells = document.querySelectorAll(".cell");

    cells.forEach(cell => {

        cell.classList.remove("current");

    });


    if (!step) {

        return;
    }


    const index =
        step.row * 9 + step.col;

    cells[index].classList.add("current");
}


// -------------------------------------------------------
// Display Steps
// -------------------------------------------------------

function displaySteps() {

    const container =
        document.getElementById("steps");

    container.innerHTML = "";


    if (solvingSteps.length === 0) {

        container.innerHTML =
            `<p class="empty-message">No solving steps yet.</p>`;

        return;
    }


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


    // Scroll to current step

    if (currentStep > 0) {

        const items =
            container.querySelectorAll(".step-item");

        if (items[currentStep - 1]) {

            items[currentStep - 1].scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }
}


// -------------------------------------------------------
// Update Algorithm Visualizer
// -------------------------------------------------------

function updateAlgorithm(step) {

    const algorithmSteps =
        document.querySelectorAll(".algorithm-step");


    algorithmSteps.forEach(item => {

        item.classList.remove("active");

    });


    if (!step) {

        algorithmSteps[0].classList.add("active");

        return;
    }


    if (step.type === "naked") {

        algorithmSteps[1].classList.add("active");

    } else if (step.type === "hidden") {

        algorithmSteps[2].classList.add("active");

    } else if (step.type === "backtrack") {

        algorithmSteps[4].classList.add("active");

    }
}


// -------------------------------------------------------
// Solve Button
// -------------------------------------------------------

document
    .getElementById("solveBtn")
    .addEventListener("click", function () {


        if (solving) {

            return;
        }


        solving = true;


        board =
            copyBoard(originalBoard);


        solvingSteps = [];

        currentStep = 0;


        // Create a copy for solving

        const solvingBoard =
            copyBoard(board);


        const solved =
            solveWithBacktracking(solvingBoard);


        if (!solved) {

            alert("This Sudoku has no solution.");

            solving = false;

            return;
        }


        // Save final solution

        board =
            copyBoard(solvingBoard);


        displaySteps();


        // Show first step

        if (solvingSteps.length > 0) {

            currentStep = 1;

            const step =
                solvingSteps[0];

            highlightStep(step);

            updateAlgorithm(step);
        }


        updateGrid();


        solving = false;
    });


// -------------------------------------------------------
// Next Step Button
// -------------------------------------------------------

document
    .getElementById("stepBtn")
    .addEventListener("click", function () {


        if (solvingSteps.length === 0) {

            // Generate solving steps first

            board =
                copyBoard(originalBoard);

            solvingSteps = [];

            currentStep = 0;


            const tempBoard =
                copyBoard(board);


            const solved =
                solveWithBacktracking(tempBoard);


            if (!solved) {

                alert("This Sudoku has no solution.");

                return;
            }


            displaySteps();
        }


        if (currentStep < solvingSteps.length) {

            const step =
                solvingSteps[currentStep];


            board[step.row][step.col] =
                step.value;


            currentStep++;


            highlightStep(step);

            updateAlgorithm(step);

            updateGrid();


            // Update step display

            const items =
                document.querySelectorAll(".step-item");


            items.forEach((item, index) => {

                item.style.opacity =
                    index < currentStep ? "1" : "0.45";

            });


        } else {

            board =
                getFinalSolution();

            updateGrid();

            document
                .querySelectorAll(".cell")
                .forEach(cell => {

                    cell.classList.remove("current");

                });


            document
                .querySelectorAll(".algorithm-step")
                .forEach(step => {

                    step.classList.remove("active");

                    step.classList.add("completed");

                });
        }
    });


// -------------------------------------------------------
// Get Final Solution
// -------------------------------------------------------

function getFinalSolution() {

    const result =
        copyBoard(originalBoard);

    solveForFinal(result);

    return result;
}


function solveForFinal(board) {

    constraintPropagation(board);

    const empty =
        findEmpty(board);

    if (empty === null) {

        return true;
    }

    const [row, col] = empty;

    const candidates =
        getCandidates(board, row, col);


    for (const number of candidates) {

        board[row][col] = number;

        if (solveForFinal(board)) {

            return true;
        }

        board[row][col] = 0;
    }

    return false;
}


// -------------------------------------------------------
// Reset
// -------------------------------------------------------

document
    .getElementById("resetBtn")
    .addEventListener("click", function () {

        board =
            copyBoard(originalBoard);

        solvingSteps = [];

        currentStep = 0;

        createGrid();

        document.getElementById("steps").innerHTML =
            `<p class="empty-message">
                Press <b>Solve Sudoku</b> to see the
                constraint propagation process.
             </p>`;

        document.getElementById("candidate-display").innerHTML =
            "Select a cell";


        document
            .querySelectorAll(".algorithm-step")
            .forEach(step => {

                step.classList.remove("active", "completed");

            });


        document
            .querySelector(".algorithm-step")
            .classList.add("active");
    });


// -------------------------------------------------------
// Clear
// -------------------------------------------------------

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

        document.getElementById("steps").innerHTML =
            `<p class="empty-message">
                Enter a Sudoku puzzle or reset the board.
             </p>`;
    });


// -------------------------------------------------------
// Initial Display
// -------------------------------------------------------

createGrid();
```
