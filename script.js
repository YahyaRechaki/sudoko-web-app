// script.js

// Function to create a random valid Sudoku board
function createInitialBoard() {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Helper function to fill board using backtracking
    function fillBoard(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    let numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of numbers) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (fillBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Shuffle array helper function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Fill the board with a valid solution
    fillBoard(board);

    // Remove some numbers to create a puzzle (leave some cells empty)
    for (let i = 0; i < 40; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        board[row][col] = 0;
    }

    return board;
}

// Function to create the Sudoku grid with initial values
function createSudokuGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';  // Clear existing grid
    const initialValues = createInitialBoard();

    for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 9; col++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('maxlength', '1');
            input.addEventListener('input', validateInput);
            if (initialValues[row][col] !== 0) {
                input.value = initialValues[row][col];
                input.setAttribute('readonly', 'readonly'); // Make predefined values readonly
            }
            td.appendChild(input);
            tr.appendChild(td);
        }
        grid.appendChild(tr);
    }
}

// Function to validate input (only allow numbers 1-9) and highlight invalid entries
function validateInput(event) {
    const value = event.target.value;
    const input = event.target;
    const row = input.parentElement.parentElement.rowIndex;
    const col = input.parentElement.cellIndex;

    if (!/^[1-9]$/.test(value) && value !== '') {
        event.target.value = '';
        return;
    }

    // Re-validate the entire grid to clear any previous invalid states
    revalidateGrid();

    if (value !== '') {
        // Highlight invalid cells
        for (let i = 0; i < 9; i++) {
            // Check row and column
            if ((i !== col && document.querySelectorAll('#sudoku-grid tr')[row].querySelectorAll('input')[i].value == value) ||
                (i !== row && document.querySelectorAll('#sudoku-grid tr')[i].querySelectorAll('input')[col].value == value)) {
                input.classList.add('invalid');
                return;
            }
        }

        // Check 3x3 square
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.querySelectorAll('#sudoku-grid tr')[startRow + i].querySelectorAll('input')[startCol + j];
                if ((startRow + i !== row || startCol + j !== col) && cell.value == value) {
                    input.classList.add('invalid');
                    return;
                }
            }
        }
    }
}

// Function to re-validate the entire grid and remove invalid highlights
function revalidateGrid() {
    const rows = document.querySelectorAll('#sudoku-grid tr');

    // Clear previous invalid states
    rows.forEach(tr => {
        tr.querySelectorAll('input').forEach(cell => {
            cell.classList.remove('invalid');
        });
    });

    // Re-validate all cells
    rows.forEach((tr, rowIndex) => {
        tr.querySelectorAll('input').forEach((cell, colIndex) => {
            const value = cell.value;
            if (value !== '') {
                // Highlight invalid cells
                for (let i = 0; i < 9; i++) {
                    // Check row and column
                    if ((i !== colIndex && rows[rowIndex].querySelectorAll('input')[i].value == value) ||
                        (i !== rowIndex && rows[i].querySelectorAll('input')[colIndex].value == value)) {
                        cell.classList.add('invalid');
                    }
                }

                // Check 3x3 square
                const startRow = Math.floor(rowIndex / 3) * 3;
                const startCol = Math.floor(colIndex / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const squareCell = rows[startRow + i].querySelectorAll('input')[startCol + j];
                        if ((startRow + i !== rowIndex || startCol + j !== colIndex) && squareCell.value == value) {
                            cell.classList.add('invalid');
                        }
                    }
                }
            }
        });
    });
}

// Function to check if a number can be placed in a specific cell
function isValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] == num || board[x][col] == num ||
            board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] == num) {
            return false;
        }
    }
    return true;
}

// Recursive function to solve the Sudoku
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] == 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) {
                            return true;
                        }
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Function to get the board from the grid
function getBoard() {
    const board = [];
    const rows = document.querySelectorAll('#sudoku-grid tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('input').forEach(cell => {
            rowData.push(cell.value ? parseInt(cell.value) : 0);
        });
        board.push(rowData);
    });
    return board;
}

// Function to fill the grid with the solved board
function fillGrid(board) {
    const rows = document.querySelectorAll('#sudoku-grid tr');
    for (let row = 0; row < 9; row++) {
        const cells = rows[row].querySelectorAll('input');
        for (let col = 0; col < 9; col++) {
            cells[col].value = board[row][col] || '';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createSudokuGrid();
    
    document.getElementById('solve-button').addEventListener('click', () => {
        const board = getBoard();
        if (solveSudoku(board)) {
            fillGrid(board);
        } else {
            alert('No solution exists');
        }
    });
});
