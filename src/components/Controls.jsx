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
          backgroundColor: isNoteMode ? "#a7c957" : "#edafb8",
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
