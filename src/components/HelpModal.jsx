import Modal from "./Modal.jsx";

export default function HelpModal({ open, onClose }) {
  return (
    <Modal id="modal-help" open={open} onClose={onClose}>
      <h2>How To Play</h2>
      <p>Guess the <strong>Sixdle</strong> in 6 tries. Each guess must be a valid 6-letter word.</p>
      <p>After each guess, the color of the tiles changes to show how close your guess was.</p>

      <div className="example-row">
        <div className="tile filled correct">S</div>
        <div className="tile filled">I</div>
        <div className="tile filled">X</div>
        <div className="tile filled">D</div>
        <div className="tile filled">L</div>
        <div className="tile filled">E</div>
      </div>
      <p><strong>S</strong> is in the word and in the correct spot.</p>

      <div className="example-row">
        <div className="tile filled">P</div>
        <div className="tile filled present">L</div>
        <div className="tile filled">A</div>
        <div className="tile filled">N</div>
        <div className="tile filled">E</div>
        <div className="tile filled">T</div>
      </div>
      <p><strong>L</strong> is in the word but in the wrong spot.</p>

      <div className="example-row">
        <div className="tile filled">G</div>
        <div className="tile filled">R</div>
        <div className="tile filled">O</div>
        <div className="tile filled absent">U</div>
        <div className="tile filled">P</div>
        <div className="tile filled">S</div>
      </div>
      <p><strong>U</strong> is not in the word in any spot.</p>

      <hr />
      <h2>Modes &amp; Difficulty</h2>
      <p><strong>Daily</strong> — one puzzle per difficulty, the same for everyone, every day.</p>
      <p><strong>Practice</strong> — play unlimited random puzzles any time.</p>
      <p><strong>Easy / Medium / Hard</strong> — controls how common the answer word is.</p>
    </Modal>
  );
}
