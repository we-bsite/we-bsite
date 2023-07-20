import React from "react";
import Home from "../components/Home";
import { DatabaseLetter, LetterInterface } from "../types";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import {
  UserLetterContextProvider,
  fetchLetters,
} from "../context/UserLetterContext";

interface Props {
  savedLetters: DatabaseLetter[];
}

// TODO: this should avoid fetching the interaction data and have that be a separate query
// honestly all that data should _definitely_ not be in a postgres db but that's how it is so ¯\_(ツ)_/¯
export const getServerSideProps: GetServerSideProps<Props> = async ({
  res,
}) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=299"
  );
  const data = await fetchLetters();
  return {
    props: {
      savedLetters: data,
    },
  };
};

export default function App({
  savedLetters,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <UserLetterContextProvider savedLetters={savedLetters}>
      <Home />
    </UserLetterContextProvider>
  );
}
