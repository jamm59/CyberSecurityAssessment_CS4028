//import Image from "next/image";
"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCubesStacked,
  faBook,
  faPlus,
  faServer,
  faChartSimple,
  faKey,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { taskOneInput, taskTwoInput, taskThreeInput } from "@/utils/extra";
import { TaskThreeType, TaskType } from "@/utils/extra";
import SettingsModal from "@/components/Setting";

export default function Home() {
  // handle settings
  const [taskNumber, setTaskNumber] = useState<number>(1);
  const [inputData, setInputData] = useState<
    TaskType[] | TaskThreeType[] | undefined
  >(
    (() => {
      switch (taskNumber) {
        case 1:
          return taskOneInput;
        case 2:
          return taskTwoInput;
        case 3:
          return taskThreeInput;
        case 4:
          return taskOneInput;
        case 5:
          return taskOneInput;
      }
    })()
  );
  const [task1to3URL, setTask1to3URL] = useState<string>("localhost:5000");
  const [task4URL, setTask4URL] = useState<string>("localhost:8000");

  const [subTitle, setSubTitle] = useState<string>("BRUTE FORCE");
  const [streamedText, setStreamedText] = useState<string>(
    "click to start cracking"
  );
  const [outputPasswords, setOutputPasswords] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(true);
  const targetSearch = "result==";
  const handleGetPassword = () => {
    // Create a WebSocket connection to the Go Fiber server
    let socket = undefined;
    if (taskNumber > 3) {
      // This case is for task 4
      socket = new WebSocket("ws://" + task4URL + "/crack");
    } else {
      // This is for task 1 to 3
      socket = new WebSocket("ws://" + task1to3URL + `/crack${taskNumber}`);
    }

    // When the WebSocket connection is established
    socket.onopen = () => {
      console.log("Connected to WebSocket server");
      setOutputPasswords([]);
      //setIsConnected(true);
    };

    // When a message is received from the server
    socket.onmessage = (event) => {
      const data: string = event.data;
      if (targetSearch.length <= data.length && data.includes("result=="))
        setTimeout(
          () =>
            setOutputPasswords((prevPasswords) => {
              const output = data.split(targetSearch)[1];
              if (!prevPasswords.includes(output))
                return [...prevPasswords, output];
              return prevPasswords;
            }),
          0
        );
      else setStreamedText(data);
    };

    socket.onerror = (event) => {
      alert("Websocket Url '" + task4URL + "' Not Valid");
      setShowModal(true);
    };

    return () => {
      socket.close();
    };
  };

  const handleDataUpdate = (index: number) => {
    switch (index) {
      case 1:
        setTaskNumber(1);
        setInputData(taskOneInput);
        setSubTitle("BRUTE FORCE");
        break;
      case 2:
        setTaskNumber(2);
        setInputData(taskTwoInput);
        setSubTitle("DICTIONARY ATTACK");
        break;
      case 3:
        setTaskNumber(3);
        setInputData(taskThreeInput);
        setSubTitle("DICTIONARY ATTACK WITH SALTS");
        break;
      case 4:
        setTaskNumber(4);
        setInputData(taskOneInput);
        setSubTitle("DISTRIBUTED CRACKING IN GOLANG");
        break;
      case 5:
        setTaskNumber(5);
        setInputData(taskOneInput);
        setSubTitle("ANALYTICS");
        break;
    }
  };

  return (
    <>
      <SettingsModal
        showModal={showModal}
        setShowModal={setShowModal}
        settingsInfo={{ task1to3URL, setTask1to3URL, task4URL, setTask4URL }}
      />
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-[#FCFAEE]">
        <h1 className="mb-10 text-4xl font-GothicOne text-black uppercase font-black">
          Security Assessment CS4028
        </h1>
        <div className="w-[80%] h-[70%] rounded-lg flex justify-center items-center shadow-2xl overflow-hidden">
          <div className="h-full bg-stone-900 w-[50%] pt-5 col-span-1 flex flex-col justify-start p-3 gap-y-3 items-center">
            <button
              onClick={() => handleDataUpdate(1)}
              className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-GothicOne hover:translate-x-3 transition-all duration-100 text-left p-2 uppercase"
            >
              <FontAwesomeIcon
                icon={faCubesStacked}
                className="ml-3"
                fontSize={24}
              />
              Brute Force
            </button>
            <button
              onClick={() => handleDataUpdate(2)}
              className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-GothicOne hover:translate-x-3 transition-all duration-100 font-extrabold text-left p-2 uppercase"
            >
              <FontAwesomeIcon icon={faBook} className="ml-3" fontSize={24} />
              DICT ATTACK
            </button>
            <button
              onClick={() => handleDataUpdate(3)}
              className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-GothicOne hover:translate-x-3 transition-all duration-100 font-extrabold text-left p-2 uppercase"
            >
              <FontAwesomeIcon icon={faPlus} className="ml-3" fontSize={24} />
              SALT ATTACKS
            </button>
            <button
              onClick={() => handleDataUpdate(4)}
              className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-GothicOne hover:translate-x-3 transition-all duration-100 font-extrabold text-left p-2 uppercase"
            >
              <FontAwesomeIcon icon={faServer} className="ml-3" fontSize={24} />
              DISTRIBUTED
            </button>
            <button
              onClick={() => handleDataUpdate(5)}
              className="w-full flex justify-start items-center gap-3 py-3 rounded-lg text-lg font-GothicOne hover:translate-x-3 transition-all duration-100 font-extrabold text-left p-2 uppercase"
            >
              <FontAwesomeIcon
                icon={faChartSimple}
                className="ml-3"
                fontSize={24}
              />
              ANALYTICS
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-white text-black flex justify-start mt-auto items-center gap-3 py-3 rounded-lg text-lg font-GothicOne transition-all duration-100 font-extrabold text-left p-2 uppercase"
            >
              <FontAwesomeIcon icon={faCog} className="ml-3" />
              Settings
            </button>
          </div>
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 h-full flex flex-col p-2 w-[30%] justify-start items-center">
            <h4 className="uppercase font-black text-black">input hashes</h4>
            {taskNumber === 3
              ? inputData !== undefined &&
                inputData.map(
                  (input: TaskThreeType | TaskType, index: number) => {
                    // Check if the input is TaskThreeType by verifying if 'hashedPassword' exists
                    if (typeof input === "string") return;
                    return (
                      <p
                        className="text-xs break-words w-full shadow-lg p-1 mb-1 rounded-lg text-black"
                        key={index}
                      >
                        {}.{input.hashedPassword.slice(0, 70)}...,
                      </p>
                    );
                  }
                )
              : inputData !== undefined &&
                inputData.map(
                  (input: TaskThreeType | TaskType, index: number) => {
                    // Check if the input is TaskThreeType by verifying if 'hashedPassword' exists
                    if (typeof input === "string") {
                      return (
                        <p
                          className="text-sm break-words w-full shadow-lg p-2 mb-1 rounded-lg text-black"
                          key={index}
                        >
                          {input.slice(0, 70)}...,
                        </p>
                      );
                    }
                    return (
                      <p
                        className="text-sm break-words w-full shadow-lg p-2 mb-1 rounded-lg text-black"
                        key={index}
                      >
                        {input.hashedPassword.slice(0, 70)}...,
                      </p>
                    );
                  }
                )}
          </div>
          <div className="p-2 w-full h-full rounded-lg grid grid-rows-4 overflow-hidden">
            <div className="grid place-items-center row-span-3">
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
          </div>
        </div>
      </div>
    </>
  );
}
