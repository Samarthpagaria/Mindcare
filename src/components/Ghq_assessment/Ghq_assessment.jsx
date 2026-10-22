import React, { useEffect, useState } from "react";
import GhqModal from "./ghq_modal";
import { ghqQuestions, ghqOptions } from "./ghq_utils";

const Ghq_assessment = () => {
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(
    ghqQuestions.map((q) => ({ question: q, answer: null }))
  );

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleOptionSelect = (value) => {
    const selectedLabel = ghqOptions.find((opt) => opt.value === value)?.label;
    const updated = [...answers];
    updated[current] = {
      question: ghqQuestions[current],
      answer: selectedLabel,
    };
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < ghqQuestions.length - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <GhqModal show={showModal} onClose={() => setShowModal(false)} />
      <div className="flex justify-center items-center w-full min-h-[80vh] py-8">
        <div className="bg-white shadow-2xl rounded-lg p-8 sm:p-12 w-11/12 border border-neutral-200 flex flex-col justify-center items-center h-full">
          <h1 className="text-3xl font-bold text-purple-900 mb-2 ">
            GHQ-12 Assessment
          </h1>
          <p className="text-lg text-purple-700 mb-6 ">
            A simple step towards clarity
          </p>
          {/* Progress Bar */}
          <div className="w-full h-[1.5px] bg-purple-200 rounded-full mb-6 shadow-inner relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:
                  current === ghqQuestions.length - 1
                    ? "100%"
                    : `${((current + 1) / ghqQuestions.length) * 100}%`,
                background: "linear-gradient(90deg, #c4b5fd 0%, #a78bfa 100%)",
                boxShadow: "0 2px 8px 0 rgba(168,139,250,0.15)",
              }}
            ></div>
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-purple-700 select-none">
              {current === ghqQuestions.length - 1
                ? 100
                : Math.round(((current + 1) / ghqQuestions.length) * 100)}
              %
            </span>
          </div>
          <div className="w-7/12 max-w-4xl mx-auto ">
            <p className="mb-6 text-lg sm:text-xl text-purple-900 font-medium">
              <span className="font-semibold text-purple-900">
                {current + 1}.
              </span>{" "}
              {ghqQuestions[current]}
            </p>
            <div className="flex flex-col gap-2 mb-8 w-full ">
              {ghqOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`py-2 rounded-2xl border text-base font-medium transition-colors w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-100 ${
                    answers[current].answer === opt.label
                      ? "bg-purple-400 text-white border-purple-500"
                      : "bg-purple-50 text-purple-900 border-purple-100 hover:bg-purple-100"
                  }`}
                  onClick={() => handleOptionSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-end w-full mx-auto mt-8 pb-2">
              <button
                className="px-6 py-2 bg-transparent border border-purple-400 text-purple-700 rounded-2xl font-semibold hover:bg-purple-200 transition-colors"
                onClick={handlePrev}
                disabled={current === 0}
              >
                Previous
              </button>
              <button
                className={`px-6 py-2 border border-purple-400 rounded-2xl font-semibold transition-colors ${
                  answers[current].answer === null
                    ? "bg-purple-300 text-purple-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                onClick={() => {
                  if (current === ghqQuestions.length - 1) {
                    console.log("GHQ Answers:", answers);
                  } else {
                    handleNext();
                  }
                }}
                disabled={answers[current].answer === null}
              >
                {current === ghqQuestions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ghq_assessment;
