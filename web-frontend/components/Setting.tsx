"use client";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function SettingsModal({
  children,
  showModal = false,
  setShowModal,
}: any) {
  const modalRef = useRef<any>();
  const [task1to3URL, setTask1to3URL] = useState("localhost:5000");
  const [task4URL, setTask4URL] = useState("localhost:8000");

  // Function to close the modal
  const handleModalClose = (event: any) => {
    event.preventDefault();
    setShowModal(false);
    modalRef.current.close();
    localStorage.setItem("visited", "true"); // Set "visited" flag after closing
  };

  // Check if the user has visited the page before
  useEffect(() => {
    const isVisited = localStorage.getItem("visited");
    if (!isVisited) {
      setShowModal(true);
    }
  }, [setShowModal]);

  // Show or close modal based on showModal state
  useEffect(() => {
    if (showModal) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [showModal]);

  // Handlers for the inputs
  const handleTask1to3URLChange = (e: any) => {
    setTask1to3URL(e.target.value);
  };

  const handleTask4URLChange = (e: any) => {
    setTask4URL(e.target.value);
  };

  return (
    <>
      <dialog
        ref={modalRef}
        className="w-1/2 h-3/4 p-5 rounded-md bg-white shadow-lg"
      >
        <div className="w-full flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-700">Settings</h2>
          <button
            className="font-OpenSans bg-white text-black shadow-lg  transition-all duration-100 hover:translate-x-1 hover:translate-y-1 text-base text-center px-4 py-2 rounded-lg"
            onClick={handleModalClose}
          >
            <FontAwesomeIcon icon={faPlus} /> Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-4 w-1/2">
          {/* Task 1-3 URL Input */}
          <div>
            <label
              htmlFor="task1to3URL"
              className="block text-sm font-medium text-gray-700"
            >
              Task 1-3 URL
            </label>
            <input
              id="task1to3URL"
              type="text"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={task1to3URL}
              onChange={handleTask1to3URLChange}
              placeholder="Enter URL for Task 1-3"
            />
          </div>

          {/* Task 4 URL Input */}
          <div>
            <label
              htmlFor="task4URL"
              className="block text-sm font-medium text-gray-700"
            >
              Task 4 URL
            </label>
            <input
              id="task4URL"
              type="text"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={task4URL}
              onChange={handleTask4URLChange}
              placeholder="Enter URL for Task 4"
            />
          </div>
        </div>

        {children}
      </dialog>
    </>
  );
}
