import people from "./people.json";
import { LetterInterface, LetterType } from "../types";

export const Letters: Array<LetterInterface> = [
  {
    id: "spencer-0",
    to: "reboot & internet",
    from: people.spencer,
    src: "https://spencerchang.me/posts/everyday-magic",
    initialPersistenceData: {
      rotation: 3,
      x: 50,
      y: 13,
    },
    date: new Date("2021-12-02"),
    type: LetterType.IFrame,
  },
  {
    id: "jacky-0",
    to: "reboot & internet",
    from: people.jacky,
    src: "https://jzhao.xyz/posts/towards-data-neutrality/",
    initialPersistenceData: {
      rotation: -2,
      x: 0,
      y: 0,
    },
    date: new Date("2022-07-14"),
    type: LetterType.IFrame,
  },
  {
    id: "spencer-1",
    to: people.jacky,
    from: people.spencer,
    src: "https://spencerchang.me/posts/our-internet",
    initialPersistenceData: {
      rotation: 5,
      x: 0,
      y: -55,
    },
    date: new Date("2022-12-11"),
    type: LetterType.IFrame,
  },
  {
    id: "jacky-1",
    to: people.spencer,
    from: people.jacky,
    src: "https://jzhao.xyz/posts/communal-computing/",
    initialPersistenceData: {
      rotation: 1,
      x: -10,
      y: 40,
    },
    date: new Date("2022-12-26"),
    type: LetterType.IFrame,
  },
  {
    id: "katherine-0",
    to: "the internet",
    from: people.katherine,
    initialPersistenceData: {
      rotation: 1,
      x: -5,
      y: -50,
    },
    src: "https://whykatherine.github.io/assets/manifesto/manifesto.pdf",
    date: new Date("2021-09-01"),
    type: LetterType.IFrame,
  },
  {
    id: "chia-0",
    to: "the internet",
    from: people.chia,
    initialPersistenceData: {
      rotation: 4,
      x: -40,
      y: -5,
    },
    src: "https://chias.blog/2022/there-is-an-internet-that-is-mine/",
    date: new Date("2022-12-12"),
    type: LetterType.IFrame,
  },
];
