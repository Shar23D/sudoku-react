import { useEffect } from "react";

const DifficultyModal = ({ isOpen, onClose, onSelectDifficulty }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Choose Difficulty</h2>
        <div className="difficulty-buttons">
          <button
            onClick={() => onSelectDifficulty("easy")}
            className="difficulty-btn easy"
          >
            Easy
          </button>
          <button
            onClick={() => onSelectDifficulty("medium")}
            className="difficulty-btn medium"
          >
            Medium
          </button>
          <button
            onClick={() => onSelectDifficulty("hard")}
            className="difficulty-btn hard"
          >
            Hard
          </button>
        </div>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DifficultyModal;
