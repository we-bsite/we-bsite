import React from "react";
import Home from "../components/Home";
import { DatabaseLetter, LetterInterface } from "../types";
import {
  GetServerSideProps,
  GetStaticProps,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
} from "next";
import {
  InitialFetchSize,
  UserLetterContextProvider,
  fetchLetters,
} from "../context/UserLetterContext";

interface Props {
  savedLetters: DatabaseLetter[];
}

// TODO: this should avoid fetching the interaction data and have that be a separate query
// honestly all that data should _definitely_ not be in a postgres db but that's how it is so ¯\_(ツ)_/¯
export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = await fetchLetters({ from: 0, to: InitialFetchSize });
  return {
    props: {
      savedLetters: data,
    },
    revalidate: 60,
  };
};

export default function App({
  savedLetters,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <UserLetterContextProvider initialLoadLetters={savedLetters}>
      <Home />
    </UserLetterContextProvider>
  );
}
