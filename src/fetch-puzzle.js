export const fetchPuzzle = async ({
  setError,
  setStatus,
  setPuzzle,
  setSolution,
  setBoard,
  setSelected,
  setCurrentDifficulty,
  difficulty = "medium", // Default difficulty value
}) => {
  try {
    setStatus("Loading...");

    let validPuzzle = false; // Flag to check if we found a valid puzzle
    let grid = null;

    // Loop until we get a puzzle with the correct difficulty
    while (!validPuzzle) {
      const response = await fetch(
        "https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value,solution,difficulty}}}",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (
        !data ||
        !data.newboard ||
        !data.newboard.grids ||
        !data.newboard.grids[0]
      ) {
        throw new Error("Invalid API response format");
      }

      grid = data.newboard.grids[0];

      // Check if the difficulty matches the selected one
      if (grid.difficulty && grid.difficulty.toLowerCase() === difficulty) {
        validPuzzle = true;
      } else {
        setStatus(`Puzzle difficulty is ${grid.difficulty}, retrying...`);
      }
    }

    // Once a valid puzzle is found, process it
    const puzzleGrid = grid.value.map((row) =>
      row.map((cell) => (cell === 0 ? null : cell))
    );

    const solutionGrid = grid.solution.map((row) =>
      row.map((cell) => (cell === 0 ? null : cell))
    );

    setPuzzle(puzzleGrid);
    setSolution(solutionGrid);
    setBoard(puzzleGrid.map((row) => [...row]));
    setSelected(null);
    setStatus("");
    setError("");

    // Update the current difficulty
    if (setCurrentDifficulty) {
      setCurrentDifficulty(grid.difficulty.toLowerCase());
    }
  } catch (err) {
    setError(`Error loading puzzle: ${err.message}`);
    setStatus("");
  }
};
