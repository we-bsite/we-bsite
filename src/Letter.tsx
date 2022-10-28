import { Letter } from "./App";

interface Props {
  letter: Letter;
}

export function LetterView({ letter }: Props) {
  const { src, to, from, date } = letter;
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
