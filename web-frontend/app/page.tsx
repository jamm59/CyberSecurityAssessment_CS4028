//import Image from "next/image";
"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faBook,
  faPlus,
  faServer,
  faChartSimple,
  faLockOpen,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { split } from "postcss/lib/list";

export default function Home() {
  const [subTitle, setSubTitle] = useState<String>("DISTRIBUTED CRACKING");
  const [streamedText, setStreamedText] = useState<String>(
    "click to start cracking"
  );
  const [outputPasswords, setOutputPasswords] = useState<String[]>([]);
  const targetSearch = "result==";
  const handleGetPassword = () => {
    // Create a WebSocket connection to the Go Fiber server
    const socket = new WebSocket("ws://localhost:8000/crack");

    // When the WebSocket connection is established
    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      //setIsConnected(true);
    };

    // When a message is received from the server
    socket.onmessage = (event) => {
      const data: String = event.data;
      if (targetSearch.length <= data.length && data.includes("result=="))
        setTimeout(
          () =>
            setOutputPasswords((prevPasswords) => [
              ...prevPasswords,
              data.split(targetSearch)[1],
            ]),
          0
        );
      else setStreamedText(data);
    };

    return () => {
      socket.close();
    };
  };

  // Handle WebSocket connection closing
  // socket.onclose = () => {
  //   console.log("WebSocket connection closed");
  //   //setIsConnected(false);
  // };

  // Handle any errors during WebSocket communication
  //   socket.onerror = (error) => {
  //     console.error("WebSocket error: ", error);
  //   };

  // Clean up the WebSocket connection when the component is unmounted

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-white">
      <h1 className="mb-10 text-4xl font-GothicOne text-black uppercase font-black">
        Security Assessment CS4028
      </h1>
      <div className="w-[80%] h-[70%] rounded-lg flex justify-center items-center shadow-2xl overflow-hidden">
        <div className="h-full bg-stone-900 w-[50%] pt-5 col-span-1 flex flex-col justify-start p-3 gap-y-3 items-center">
          <button className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-OpenSans hover:translate-x-3 transition-all duration-100 font-black text-left p-2 uppercase">
            <FontAwesomeIcon icon={faDumbbell} className="ml-3" />
            Task One
          </button>
          <button className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-OpenSans hover:translate-x-3 transition-all duration-100 font-black text-left p-2 uppercase">
            <FontAwesomeIcon icon={faBook} className="ml-3" />
            Task Two
          </button>
          <button className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-OpenSans hover:translate-x-3 transition-all duration-100 font-black text-left p-2 uppercase">
            <FontAwesomeIcon icon={faPlus} className="ml-3" />
            Task Three
          </button>
          <button className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-OpenSans hover:translate-x-3 transition-all duration-100 font-black text-left p-2 uppercase">
            <FontAwesomeIcon icon={faServer} className="ml-3" />
            Task Four
          </button>
          <button className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-OpenSans hover:translate-x-3 transition-all duration-100 font-black text-left p-2 uppercase">
            <FontAwesomeIcon icon={faChartSimple} className="ml-3" />
            Graphs
          </button>
        </div>
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 h-full flex flex-col w-[30%] justify-center items-center">
          <h4 className="uppercase font-black text-black">input hashes</h4>
          <p className="text-sm break-words w-full shadow-xl p-3 rounded-lg text-black">
            "f14aae6a0e050b74e4b7b9a5b2ef1a60ceccbbca39b132ae3e8bf88d3a946c6d8687f3266fd2b626419d8b67dcf1d8d7c0fe72d4919d9bd05efbd37070cfb41a",
          </p>
          <p className="text-sm break-words w-full shadow-xl p-3 rounded-lg text-black">
            "e85e639da67767984cebd6347092df661ed79e1ad21e402f8e7de01fdedb5b0f165cbb30a20948f1ba3f94fe33de5d5377e7f6c7bb47d017e6dab6a217d6cc24",
          </p>
          <p className="text-sm break-words w-full shadow-xl p-3 rounded-lg text-black">
            "4e2589ee5a155a86ac912a5d34755f0e3a7d1f595914373da638c20fecd7256ea1647069a2bb48ac421111a875d7f4294c7236292590302497f84f19e7227d80",
          </p>
          <p className="text-sm break-words w-full shadow-xl p-3 rounded-lg text-black">
            "afd66cdf7114eae7bd91da3ae49b73b866299ae545a44677d72e09692cdee3b79a022d8dcec99948359e5f8b01b161cd6cfc7bd966c5becf1dff6abd21634f4b",
          </p>
        </div>
        <div className="p-2 w-full h-full rounded-lg grid grid-rows-3 overflow-hidden">
          <div className="grid place-items-center">
            <h3 className="font-black text-black text-2xl uppercase grid place-items-center">
              {subTitle}
            </h3>
            <div className="tracking-wide text-black grid text-2xl place-items-center">
              {streamedText}
            </div>
            <div className="flex flex-wrap p-2 gap-2">
              {outputPasswords.map((pass, idx) => (
                <div
                  key={idx}
                  className="rounded-md shadow-xl px-4 bg-sky-200 py-2 flex justify-center items-center gap-2 text-black text-center text-base font-OpenSans"
                >
                  <FontAwesomeIcon icon={faKey} />
                  {pass}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 place-items-center">
            <button
              onClick={handleGetPassword}
              className="font-OpenSans bg-white text-black text-base shadow-lg transition-all duration-100 hover:translate-x-1 hover:translate-y-1 text-center px-4 py-2 rounded-lg"
            >
              start cracking
            </button>
            <button className="font-OpenSans bg-white text-black shadow-lg  transition-all duration-100 hover:translate-x-1 hover:translate-y-1 text-base text-center px-4 py-2 rounded-lg">
              stop cracking
            </button>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
