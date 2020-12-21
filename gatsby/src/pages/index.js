import React from "react";
import useLatestData from "../utils/useLatestData";
import { HomePageGrid } from "../styles/Grids";
import LoadingGrid from "../components/LoadingGrid";

function CurrentlySlicing({ slicemasters }) {
  return (
    <div>
      {!slicemasters && <LoadingGrid count={4} />}
      {slicemasters && !slicemasters?.length && (
        <p>No one is working right now</p>
      )}
    </div>
  );
}

function HotSlices({ hotSlices }) {
  return (
    <div>
      {!hotSlices && <LoadingGrid count={4} />}
      {hotSlices && !hotSlices?.length && <p>Nothing in the case</p>}
    </div>
  );
}

export default function HomePage() {
  const { hotSlices, slicemasters } = useLatestData();

  return (
    <div className="center">
      <h1>The Best Pizza Downtown!</h1>
      <p>Open 11am to 11pm Every Single Day</p>
      <HomePageGrid>
        <CurrentlySlicing slicemasters={slicemasters}></CurrentlySlicing>
        <HotSlices hotSlices={hotSlices}></HotSlices>
      </HomePageGrid>
    </div>
  );
}
