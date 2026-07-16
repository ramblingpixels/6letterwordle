export default function Modal({ id, open, onClose, className, children }) {
  if (!open) return null;
  return (
    <div
      id={id}
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={"modal" + (className ? " " + className : "")}>
        <button className="modal-close" onMouseDown={(e) => e.preventDefault()} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
