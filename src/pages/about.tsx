import Link from "next/link";
import React from "react";
import { Footer } from "../components/Footer";
import { Signature } from "../components/Signature";

export default function About() {
  return (
    <>
      <GalleryLink />
      <div className="topSignature">
        <Signature repeat={6} />
      </div>
      <div className="App">
        <h1>about (we)bsite</h1>
        <div className="aboutContent">
          <p>
            <em>(we)bsite</em> is a living collection of internet dreams from
            people like you, inhabitants of the internet. It aims to create
            space to hold, show, and uplift everyday visions and hopes for the
            internet.
          </p>
          <p>
            Despite all the time we spend on the internet, most of us are
            passive consumers of content and interfaces. Our standard digital
            environments do not offer let alone encourage us to imagine and
            create alternative futures for the internet.
          </p>
          <p>
            What if everyone who used the internet was encouraged to dream about
            it? What would it look like if we collectively imagine and build a
            better internet together?
          </p>
          <p>
            Change starts with possibility. We hope <em>(we)bsite</em> can be a
            catalyst for change by showing all the love, care, memories, and
            dreams that people have for the internet.
          </p>
          <h3>Colongraph</h3>
          <p>
            The intention behind the building of this site first and foremost
            was for it to feel <em>fun</em>. We believe that computing should be
            playful and take inspiration from those who have advocated for this
            (<a href="https://casholman.com/">Cas Holman</a>,{" "}
            <a href="https://en.wikipedia.org/wiki/Homo_Ludens">
              Johan Huizinga
            </a>
            ,{" "}
            <a href="https://objectionable.net/games-agency-as-art/">
              C. Thi Nguyen
            </a>
            , and many others). This has manifested in many fun, at times
            unpractical, and interesting interactions that play with new ways of
            relating to one another in a digital space. For example,
            <ul>
              <li>dragging a letter to the desk to open it</li>
              <li>
                visualizing the letters as real letters and the many animations
                associated with it
              </li>
              <li>every visitor has their own unique fingerprint</li>
              <li>
                {`visitors' fingerprints are left on the letters they drag, so that
              they are able to passively leave a presence. Others are ambiently
              aware of who has been here`}
              </li>
              <li>
                {`real-time passive presence through cursors that match each
              person's color and through the fingerprints as they touch each
              letter.`}
              </li>
              <li>
                letters remember where they have been dragged to emulate the
                permanence of actions in the physical world
              </li>
            </ul>
          </p>
          <p>
            All code is{" "}
            <a href="https://github.com/we-bsite/we-bsite/">open-source</a> and
            we welcome ideas, contributions, and extensions. The data is also
            public. Please contact us if you are interested in supporting the
            project through extensions or advocacy.
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
}

export function AboutLink() {
  return (
    <div className="aboutLink">
      <Link className="buttonLink" href="/about">
        <button>About</button>
      </Link>
    </div>
  );
}

export function GalleryLink() {
  return (
    <div className="galleryLink">
      <Link className="buttonLink" href="/">
        <button>Gallery</button>
      </Link>
    </div>
  );
}
