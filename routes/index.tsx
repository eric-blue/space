import { Head } from "$fresh/runtime.ts";
import Three from "../islands/Three.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>fresh threejs</title>
      </Head>
      <Three/>
    </>
  );
}
