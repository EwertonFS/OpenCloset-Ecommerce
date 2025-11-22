import React from "react";
import { Check } from "lucide-react";

interface CheckoutStepsProps {
  currentStep: "identification" | "payment" | "confirmation";
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { name: "Sacola", status: "completed" },
    { name: "Identificação", status: currentStep === "payment" ? "completed" : currentStep === "identification" ? "active" : "upcoming" },
    { name: "Pagamento", status: currentStep === "payment" ? "active" : "upcoming" },
  ];

  const getStepClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "active":
        return "bg-green-600 text-white";
      default:
        return "border-2 border-gray-300 text-gray-500";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center ${getStepClass(step.status)}`}>
                {step.status === "completed" ? <Check size={16} className="md:w-5 md:h-5" /> : <span className="text-sm md:text-base font-semibold">{index + 1}</span>}
              </div>
              <span className={`text-sm md:text-base font-medium ${step.status === 'active' ? 'font-bold text-gray-900' : 'text-gray-500 hidden sm:block'}`}>{step.name}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 md:mx-4 ${steps[index + 1].status !== 'upcoming' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
