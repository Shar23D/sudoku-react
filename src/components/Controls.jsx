import DarkModeToggle from "./DarkModeToggle";

const Controls = ({
  handleCheck,
  handleReset,
  handleNewPuzzle,
  isNoteMode,
  setIsNoteMode,
  handleHint,
}) => {
  return (
    <div className="controls">
      <button onClick={handleCheck}>
        Check
      </button>
      <button onClick={handleReset}>
        Reset
      </button>
      <button onClick={handleNewPuzzle} >
        New Puzzle
      </button>
      <button
        onClick={() => setIsNoteMode(!isNoteMode)}
        style={{
          backgroundColor: isNoteMode ? "#275b29" : "#ff8785",
          color: isNoteMode ? "white" : "#333d29",
          cursor: "pointer",
        }}
      >
        Notes
      </button>
      <button onClick={handleHint}>Hint</button>
            <DarkModeToggle /> 
    </div>
  );
};

export default Controls;
