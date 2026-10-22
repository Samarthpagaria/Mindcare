import React from "react";
import { CircleX } from "lucide-react";

const ModalGHQ12 = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-2">
      <div className="bg-[#f0f9ff] border-2 border-sky-600 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl flex flex-col items-center relative">
        <CircleX
          className="absolute top-4 right-4 cursor-pointer text-sky-900 hover:text-gray-700"
          size={28}
          onClick={onClose}
        />
        <div className="w-full text-left">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Your Wellbeing Check-In
          </h2>
          <p className="mb-6 text-center text-lg">
            Life as a student can be demanding. This is a quiet moment to pause
            and reflect on your overall wellbeing.{" "}
            <span role="img" aria-label="sparkle">
              ✨
            </span>
          </p>
          <p className="mb-6 text-gray-700 text-base">
            This brief self-check (the GHQ-12) includes 12 questions about your
            experiences over the last few weeks. It helps you notice changes
            from your usual self—looking at everything from your concentration
            to your ability to face challenges.
          </p>
          <div className="mb-6 text-base">
            <ul className="space-y-3">
              <li>
                <span className="font-bold">Completely Confidential.</span> Your
                answers are for your eyes only. This is your private space to
                reflect.
              </li>
              <li>
                <span className="font-bold">Honesty, Not Comparison.</span>{" "}
                There are no "right" answers, only what feels true for you right
                now.
              </li>
              <li>
                <span className="font-bold">A Guide, Not a Diagnosis.</span>{" "}
                Think of this as a helpful overview of your current mental
                wellness, not a medical conclusion.
              </li>
            </ul>
          </div>
          <p className="text-base text-center font-medium">
            Thank you for taking this time for yourself. You're in the right
            place.
            <br />
            Let's begin when you're ready. 🌱
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalGHQ12;
