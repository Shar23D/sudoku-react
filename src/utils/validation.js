// Sudoku validation functions
export const isValidMove = (board, row, col, num) => {
  if (num === null || num === "") return true;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && board[r][c] === num) {
        return false;
      }
    }
  }

  return true;
};

export const findViolations = (board) => {
  const violations = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num !== null && !isValidMove(board, row, col, num)) {
        violations.push([row, col]);
      }
    }
  }

  return violations;
};
