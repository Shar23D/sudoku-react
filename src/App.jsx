import { useState } from "react";
import "./App.css";
import Grid from "./components/Grid";
import Controls from "./components/Controls";
import DifficultyModal from "./components/DifficultyModal";
import NumberPad from "./components/NumberPad";
import { findViolations } from "./utils/validation";
import { useEffect } from "react";
import { fetchPuzzle } from "./fetch-puzzle";
import FloatingIcon from "./components/FloatingIcon";
import DarkModeToggle from "./components/DarkModeToggle";

function App() {
  const [board, setBoard] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );

  const [puzzle, setPuzzle] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );

  const [solution, setSolution] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState("medium");
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [notes, setNotes] = useState(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(() => new Set()))
      .map((row) => row.map((cell) => cell()))
  );

  const [highlightedNumber, setHighlightedNumber] = useState(null);

  useEffect(() => {
    fetchPuzzle({
      setError,
      setStatus,
      setPuzzle,
      setSolution,
      setBoard,
      setSelected,
      setCurrentDifficulty,
    });
  }, []);

  // Check for violations whenever board changes
  useEffect(() => {
    setViolations(findViolations(board));
  }, [board]);

  // Add global keyboard listener for number highlighting
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Only handle when no input is focused
      if (!e.target.matches("input")) {
        // Handle number keys (1-9) for highlighting
        if (e.key >= "1" && e.key <= "9") {
          e.preventDefault();
          highlightSameValue(parseInt(e.key));
          setSelected(null); // Clear selection when highlighting globally
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isNoteMode]); // Add isNoteMode as dependency so the toggle works correctly

  useEffect(() => {
    const handleClickOutside = (e) => {
      // If the click is outside the puzzle area
      if (!e.target.closest(".puzzle-container")) {
        clearHighlights(); // Clear the highlights
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [puzzle]); // reset when puzzle changes

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  // Compute counts for number inputs
  const counts = board.flat().reduce((acc, num) => {
    if (num != null) acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});

  const handleCheck = () => {
    const flatBoard = board.flat();
    const flatSolution = solution.flat();

    if (flatBoard.every((cell, i) => cell === flatSolution[i])) {
      setStatus("🎉 Congratulations! Puzzle solved! 🎉");
      setStatusType("success");
      setIsComplete(true);

      let count = 0;
      const totalCells = 81;
      const interval = setInterval(() => {
        count++;
        setCorrectCount(count);
        if (count === totalCells) clearInterval(interval);
      }, 30);
    } else {
      setStatus("❌ Not quite right. Keep trying!");
      setStatusType("error");
      // Clear error message after 3 seconds
      setTimeout(() => {
        if (statusType === "error") {
          setStatus("");
          setStatusType(null);
        }
      }, 3000);
    }
  };

  const handleReset = () => {
    setBoard(puzzle.map((row) => [...row]));
    setStatus("🔄 Puzzle reset to original state");
    setStatusType("info");
    setTimerSeconds(0);
    setHintsUsed(0);
    setSelected(null);
    setCorrectCount(0);
    clearHighlights();
    // Clear info message after 2 seconds
    setTimeout(() => {
      if (statusType === "info") {
        setStatus("");
        setStatusType(null);
      }
    }, 2000);
    // Clear all notes
    setNotes(
      Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(() => new Set())
        )
    );
  };

  const handleNewPuzzle = () => {
    setShowDifficultyModal(true);
    setTimerSeconds(0);
    setHintsUsed(0);
    clearHighlights();
  };

  const handleDifficultySelect = (difficulty) => {
    setCurrentDifficulty(difficulty);
    setCorrectCount(0);
    setShowDifficultyModal(false);
    setStatus("🆕 Loading new puzzle...");
    setStatusType("info");

    // Clear notes when getting new puzzle
    setNotes(
      Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(() => new Set())
        )
    );

    fetchPuzzle({
      setError,
      setStatus,
      setPuzzle,
      setSolution,
      setBoard,
      setSelected,
      setCurrentDifficulty,
      difficulty,
    });
  };
  const handleHint = () => {
    // Find incorrect non-prefilled cells
    const incorrectCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (
          puzzle[r][c] === null && // not a given
          board[r][c] !== null && // filled in by user
          board[r][c] !== solution[r][c] // but incorrect
        ) {
          incorrectCells.push([r, c]);
        }
      }
    }

    // If there are incorrect cells, correct one of them
    if (incorrectCells.length > 0) {
      const [r, c] =
        incorrectCells[Math.floor(Math.random() * incorrectCells.length)];
      const correctValue = solution[r][c];

      setBoard((prev) => {
        const newBoard = prev.map((row) => [...row]);
        newBoard[r][c] = correctValue;
        return newBoard;
      });

      setNotes((prev) => {
        const newNotes = prev.map((row) =>
          row.map((cellNotes) => new Set(cellNotes))
        );
        newNotes[r][c].clear();
        return newNotes;
      });

      setSelected([r, c]);
      setStatus(`💡 Fixed incorrect cell at row ${r + 1}, column ${c + 1}`);
      setHintsUsed(hintsUsed + 1);
      setStatusType("hint");
      // Clear hint message after 3 seconds
      setTimeout(() => {
        if (statusType === "hint") {
          setStatus("");
          setStatusType(null);
        }
      }, 3000);
      return;
    }

    // No incorrect cells — fallback to hinting an empty one
    const emptyCells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] === null && board[r][c] === null) {
          emptyCells.push([r, c]);
        }
      }
    }

    if (emptyCells.length === 0) {
      setStatus("✅ No empty or incorrect cells left!");
      setStatusType("info");

      // Clear info message after 2 seconds
      setTimeout(() => {
        if (statusType === "info") {
          setStatus("");
          setStatusType(null);
        }
      }, 2000);
      return;
    }

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const correctValue = solution[r][c];

    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      newBoard[r][c] = correctValue;
      return newBoard;
    });

    setNotes((prev) => {
      const newNotes = prev.map((row) =>
        row.map((cellNotes) => new Set(cellNotes))
      );
      newNotes[r][c].clear();
      return newNotes;
    });

    setSelected([r, c]);
    setStatus(`💡 Added hint at row ${r + 1}, column ${c + 1}`);
    setHintsUsed(hintsUsed + 1);
    setStatusType("hint");

    // Clear hint message after 3 seconds
    setTimeout(() => {
      if (statusType === "hint") {
        setStatus("");
        setStatusType(null);
      }
    }, 3000);
  };

  const handleInput = (rIdx, cIdx, value) => {
    if (value === "" || /^[1-9]$/.test(value)) {
      const num = parseInt(value);
      const currentValue = board[rIdx][cIdx];
      const isSameValue = num === currentValue;

      // Prevent inserting a number that's already at max count (unless it's being replaced)
      if (!isSameValue && num && counts[num] >= 9) return;

      if (isNoteMode) {
        // Toggle note
        setNotes((prev) => {
          const newNotes = prev.map((row) =>
            row.map((cellNotes) => new Set(cellNotes))
          );

          if (newNotes[rIdx][cIdx].has(num)) {
            newNotes[rIdx][cIdx].delete(num);
          } else {
            newNotes[rIdx][cIdx].add(num);
          }

          return newNotes;
        });

        // Don't modify board in note mode
        return;
      }

      // Regular input mode: set number and clear notes
      setBoard((prev) =>
        prev.map((row, r) =>
          row.map((cell, c) => {
            if (r === rIdx && c === cIdx) {
              return value ? num : null;
            }
            return cell;
          })
        )
      );

      // Clear notes for the cell
      setNotes((prev) => {
        const newNotes = prev.map((row) =>
          row.map((cellNotes) => new Set(cellNotes))
        );
        newNotes[rIdx][cIdx].clear();
        return newNotes;
      });
    }
  };

  // Handle highlight cells with same value
  const highlightSameValue = (num) => {
    setHighlightedNumber(num);
  };
  // Function to clear highlights
  const clearHighlights = () => {
    setHighlightedNumber(null);
  };

  // Handle keyboard input for number replacement and navigation
  const handleKeyDown = (e, rIdx, cIdx) => {
    const isPrefilled = puzzle[rIdx][cIdx] !== null;

    // Don't allow input if cell is prefilled
    if ((isPrefilled || selected === null) && e.key >= "1" && e.key <= "9") {
      // Blur the prefilled cell to remove focus
      const cell = document.querySelector(
        `input[data-row="${rIdx}"][data-col="${cIdx}"]`
      );
      if (cell) cell.blur();
      e.preventDefault();
      highlightSameValue(parseInt(e.key));
      setSelected(null);
      return;
    }

    const key = e.key;

    // Handle arrow key navigation
    if (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      e.preventDefault();
      let newRow = rIdx;
      let newCol = cIdx;

      switch (key) {
        case "ArrowUp":
          newRow = Math.max(0, rIdx - 1);
          break;
        case "ArrowDown":
          newRow = Math.min(8, rIdx + 1);
          break;
        case "ArrowLeft":
          newCol = Math.max(0, cIdx - 1);
          break;
        case "ArrowRight":
          newCol = Math.min(8, cIdx + 1);
          break;
      }

      setSelected([newRow, newCol]);
      // Focus the new cell
      const newCell = document.querySelector(
        `input[data-row="${newRow}"][data-col="${newCol}"]`
      );
      if (newCell) {
        newCell.focus();
      }
      return;
    }

    // If user presses a number key (1-9), replace the current value or add/remove note
    if (key >= "1" && key <= "9") {
      const num = parseInt(key);
      if (counts[num] >= 9) return; // prevent adding more than 9 of a number
      e.preventDefault();
      handleInput(rIdx, cIdx, key);
    } else if (key === "Delete" || key === "Backspace" || key === " ") {
      e.preventDefault();
      if (isNoteMode) {
        // In note mode, remove note at selected cell
        setNotes((prev) => {
          const newNotes = prev.map((row) =>
            row.map((cellNotes) => new Set(cellNotes))
          );
          newNotes[rIdx][cIdx].clear(); // Clear all notes in the cell
          return newNotes;
        });
      } else {
        // In input mode, clear the value
        handleInput(rIdx, cIdx, "");
      }
    }
    // Get hint with 'H' key
    else if (key.toLowerCase() === "h") {
      e.preventDefault();
      handleHint();
    }

    // Toggle note mode with 'N' key
    else if (key.toLowerCase() === "n") {
      e.preventDefault();
      setIsNoteMode(!isNoteMode);
    }
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!board) {
    return <div>Loading!</div>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Let's play Sudoku!</h1>
      <div className="game-info">
        <div>
          Time: <b>{formatTime(timerSeconds)}</b>
        </div>
        <div>
          Level: <b>{currentDifficulty.toUpperCase()}</b>
        </div>
        <div>
          Hints Used: <b>{hintsUsed}</b>
        </div>
      </div>

      <Grid
        board={board}
        handleInput={handleInput}
        puzzle={puzzle}
        selected={selected}
        setSelected={setSelected}
        correctCount={correctCount}
        violations={violations}
        handleKeyDown={handleKeyDown}
        notes={notes}
        isNoteMode={isNoteMode}
        selectedValue={selected ? board[selected[0]][selected[1]] : null}
        highlightedNumber={highlightedNumber}
      />
      <NumberPad
        handleInput={handleInput}
        selected={selected}
        counts={counts}
      />
      <Controls
        handleCheck={handleCheck}
        handleReset={handleReset}
        handleNewPuzzle={handleNewPuzzle}
        isNoteMode={isNoteMode}
        setIsNoteMode={setIsNoteMode}
        handleHint={handleHint}
      />
      {status && (
        <div className={`status status-${statusType || "default"}`}>
          {status}
        </div>
      )}

      <DifficultyModal
        isOpen={showDifficultyModal}
        onClose={() => setShowDifficultyModal(false)}
        onSelectDifficulty={handleDifficultySelect}
      />
      <FloatingIcon />
    </div>
  );
}

export default App;
