import React from "react";
import { CircleX } from "lucide-react";
const Modal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-2">
      <div className="bg-[#caf0f8] border-2 border-blue-600 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl flex flex-col items-center relative">
        <CircleX
          className="absolute top-4 right-4 cursor-pointer text-blue-900 hover:text-gray-700"
          size={28}
          onClick={onClose}
        />
        <div className="w-full text-left">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Your Private Wellness Check-In
          </h2>
          <p className="mb-4 text-center text-lg">
            Let's take a quiet moment to see how you've been feeling.{" "}
            <span role="img" aria-label="leaf">
              🌿
            </span>
          </p>
          <p className="mb-4 text-gray-700 text-base">
            The PHQ-9 is a confidential 9-question self-check designed to help
            you understand your mood. It provides a snapshot of your wellbeing
            by reflecting on common symptoms of depression you may have
            experienced over the last two weeks.
          </p>
          <div className="mb-4">
            <p className="mb-2 font-semibold">Before you begin, please know:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-bold">It's 100% Confidential.</span> Your
                responses are for your eyes only and are never shared. This is
                your safe space.
              </li>
              <li>
                <span className="font-bold">There's No Pressure.</span> There
                are no right or wrong answers. This is about honest reflection,
                not a test.
              </li>
              <li>
                <span className="font-bold">It's Not a Diagnosis.</span> Think
                of this as a helpful snapshot of your wellbeing, not a medical
                conclusion. It’s a starting point.
              </li>
            </ul>
          </div>
          <p className="mb-2 text-base">
            Taking this time for yourself is a wonderful step. Breathe, answer
            at your own pace, and let's begin whenever you're ready.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
