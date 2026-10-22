import React from "react";
import { CircleX } from "lucide-react";

const ModalGAD7 = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-2">
      <div className="bg-[#e6fffa] border-2 border-teal-600 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl flex flex-col items-center relative">
        <CircleX
          className="absolute top-4 right-4 cursor-pointer text-teal-900 hover:text-gray-700"
          size={28}
          onClick={onClose}
        />
        <div className="w-full text-left">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Your Calm Check-In
          </h2>
          <p className="mb-6 text-center text-lg">
            This is a quiet space to check in with yourself. Let’s gently
            explore some of the feelings you may have experienced lately.{" "}
            <span role="img" aria-label="lotus">
              🪷
            </span>
          </p>
          <p className="mb-6 text-gray-700 text-base">
            This brief self-check (known as the GAD-7) includes 7 questions to
            help you get a clearer picture of your wellbeing over the last two
            weeks.
          </p>
          <div className="mb-6 text-base">
            <ul className="space-y-3">
              <li>
                <span className="font-bold">
                  Your space is completely private.
                </span>{" "}
                Your reflections are for your eyes only.
              </li>
              <li>
                <span className="font-bold">
                  This is about reflection, not perfection.
                </span>{" "}
                There are no right or wrong answers here.
              </li>
              <li>
                <span className="font-bold">
                  This is a snapshot, not a label.
                </span>{" "}
                It's a helpful starting point to understand your feelings, not a
                medical conclusion.
              </li>
            </ul>
          </div>
          <p className="text-base text-center font-medium">
            Take a soft breath. There’s no rush.
            <br />
            Answering honestly is a kind way to care for yourself. 🌱
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalGAD7;
