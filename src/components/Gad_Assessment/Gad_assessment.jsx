import React, { useEffect, useState } from "react";
import GadModal from "./gad_modal";
import { gadQuestions, gadOptions } from "./gad_utils";

const Gad_assessment = () => {
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(
    gadQuestions.map((q) => ({ question: q, answer: null }))
  );

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleOptionSelect = (value) => {
    const selectedLabel = gadOptions.find((opt) => opt.value === value)?.label;
    const updated = [...answers];
    updated[current] = {
      question: gadQuestions[current],
      answer: selectedLabel,
    };
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < gadQuestions.length - 1) setCurrent(current + 1);
  };
  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <GadModal show={showModal} onClose={() => setShowModal(false)} />
      <div className="flex justify-center items-center w-full min-h-[80vh] py-8">
        <div className="bg-white shadow-2xl rounded-lg p-8 sm:p-12 w-11/12 border border-neutral-200 flex flex-col justify-center items-center h-full">
          <h1 className="text-3xl font-bold text-green-900 mb-2 ">
            GAD-7 Assessment
          </h1>
          <p className="text-lg text-green-700 mb-6 ">
            A simple step towards clarity
          </p>
          {/* Progress Bar */}
          <div className="w-full h-[1.5px] bg-green-200 rounded-full mb-6 shadow-inner relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:
                  current === gadQuestions.length - 1
                    ? "100%"
                    : `${((current + 1) / gadQuestions.length) * 100}%`,
                background: "linear-gradient(90deg, #4ade80 0%, #22c55e 100%)",
                boxShadow: "0 2px 8px 0 rgba(34,197,94,0.15)",
              }}
            ></div>
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-green-700 select-none">
              {current === gadQuestions.length - 1
                ? 100
                : Math.round(((current + 1) / gadQuestions.length) * 100)}
              %
            </span>
          </div>
          <div className="w-7/12 max-w-4xl mx-auto ">
            <p className="mb-6 text-lg sm:text-xl text-green-900 font-medium">
              <span className="font-semibold text-green-900">
                {current + 1}.
              </span>{" "}
              {gadQuestions[current]}
            </p>
            <div className="flex flex-col gap-2 mb-8 w-full ">
              {gadOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`py-2 rounded-2xl border text-base font-medium transition-colors w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-100 ${
                    answers[current].answer === opt.label
                      ? "bg-green-400 text-white border-green-500"
                      : "bg-green-50 text-green-900 border-green-100 hover:bg-green-100"
                  }`}
                  onClick={() => handleOptionSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-end w-full mx-auto mt-8 pb-2">
              <button
                className="px-6 py-2 bg-transparent border border-green-400 text-green-700 rounded-2xl font-semibold hover:bg-green-200 transition-colors"
                onClick={handlePrev}
                disabled={current === 0}
              >
                Previous
              </button>
              <button
                className={`px-6 py-2 border border-green-400 rounded-2xl font-semibold transition-colors ${
                  answers[current].answer === null
                    ? "bg-green-300 text-green-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                onClick={() => {
                  if (current === gadQuestions.length - 1) {
                    console.log("GAD Answers:", answers);
                  } else {
                    handleNext();
                  }
                }}
                disabled={answers[current].answer === null}
              >
                {current === gadQuestions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gad_assessment;
