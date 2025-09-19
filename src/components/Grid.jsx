import classNames from "classnames";

const Grid = ({
  board,
  handleInput,
  puzzle,
  selected,
  setSelected,
  correctCount,
  violations,
  handleKeyDown,
  notes,
  isNoteMode,
  selectedValue,
  highlightedNumber,
}) => {
  return (
    <div className="container">
      <table className="table">
        <tbody>
          {board.map((row, rIdx) => {
            return (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => {
                  const isPrefilled = puzzle[rIdx][cIdx] !== null;
                  const cellIndex = rIdx * 9 + cIdx;
                  const hasViolation = violations.some(
                    ([r, c]) => r === rIdx && c === cIdx
                  );
                  const cellNotes = notes[rIdx][cIdx];

                  return (
                    <td
                      key={cIdx}
                      className={classNames("cell", {
                        "same-row": selected && rIdx === selected[0],
                        "same-col": selected && cIdx === selected[1],
                        "same-box":
                          selected &&
                          Math.floor(rIdx / 3) ===
                            Math.floor(selected[0] / 3) &&
                          Math.floor(cIdx / 3) === Math.floor(selected[1] / 3),
                        correct: cellIndex < correctCount,
                        violation: hasViolation,
                        "same-value":
                          (selectedValue !== null && cell === selectedValue) ||
                          (highlightedNumber !== null &&
                            cell === highlightedNumber),
                      })}
                    >
                      <div className="cell-wrapper">
                        {cell === null && cellNotes.size > 0 && (
                          <div className="notes-container">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <span
                                key={num}
                                className={`note ${
                                  cellNotes.has(num) ? "active" : ""
                                }`}
                              >
                                {cellNotes.has(num) ? num : ""}
                              </span>
                            ))}
                          </div>
                        )}
                        <input
                          type="text"
                          maxLength={1}
                          value={cell === null ? "" : cell}
                          readOnly={isPrefilled}
                          className={isPrefilled ? "prefilled" : ""}
                          data-row={rIdx}
                          data-col={cIdx}
                          onFocus={() => {
                            setSelected([rIdx, cIdx]);
                          }}
                          onClick={() => {
                            setSelected([rIdx, cIdx]);
                          }}
                          onChange={(e) => {
                            if (!isPrefilled) {
                              handleInput(rIdx, cIdx, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            handleKeyDown(e, rIdx, cIdx);
                          }}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;
