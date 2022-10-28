import { Letter } from "./App";

interface Props {
  letter: Letter;
}

export function LetterView({ letter }: Props) {
  const { src, to, from, date } = letter;
  //   TODO: make moveable via drag
  // TODO: clicking on letter should open in new page
  // TODO: some way to track which letters have been opened, and the ones that have been opened by more people are more worn?
  //   TODO: active cursors?
  return (
    <div className="letter">
      <div className="letterHead">
        <div className="header">Dear {to},</div>
        <span className="date">{date.toDateString()}</span>
      </div>
      <div className="iframe-wrapper">
        <iframe src={src}></iframe>
      </div>
    </div>
  );
}
