import { useContext } from "react";
import { UserLetterContext } from "../context/UserLetterContext";

export function ColorPicker({ inline }: { inline?: boolean }) {
  const {
    currentUser: { color },
    setColor,
  } = useContext(UserLetterContext);

  const child = (
    <input
      type="color"
      onChange={(e) => setColor(e.target.value)}
      value={color}
    />
  );

  return inline ? (
    <span className="colorPicker">{child}</span>
  ) : (
    <div className="colorPicker">{child}</div>
  );
}

export function Profile() {
  return (
    // person icon in top right
    <div className="profile">
      <ColorPicker />
    </div>
    // dialog trigger
    // show saved profile
    // metadata
    // - num visits
    // - num letters
    // - num letters touched
    // - times cursors met
  );
}
