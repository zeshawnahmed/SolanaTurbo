import { FC } from "react";
import pkg from "../../../package.json";

export const FaqView: FC = ({}) => {
  const question = [
    {
      question: " How Do I Create A Token?",
      answer:
        " Simply select Create Token and fill in the required details, pay a small fee (.4 Sol), and click Create Token.",
      id: "faq-1",
    },
    {
      question: " Are there more Tools on the Way?",
      answer:
        "Yes absolutely, stay tuned.",
      id: "faq-2",
    },
    {
      question: "How can I reach customer support?",
      answer:
        " Please email technical support at peaceofmindcollabs@gmail.com . Be sure to include all details about your technical issue.",
      id: "faq-3",
    }
  ];
  return (
    <section id="faq" class="py-20">
      <div class="container">
        <div class="mb-10 flex items-end justify-between">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="mb-4 text-3xl font-medium capitalize text-white">
              Frequently Asked Questions
            </h2>
            <p class="text-default-200 text-sm font-medium">
              
            </p>
          </div>
        </div>

        <div class="mx-auto max-w-3xl">
          <div class="hs-accordion-group space-y-4">
            {question.map((question, index) => (
              <div
                key={index}
                class={`hs-accordion bg-default-950/40   overflow-hidden rounded-lg border border-white/10 backdrop-blur-3xl`}
                id={question.id}
              >
                <button
                  class="hs-accordion-toggle inline-flex w-full items-center justify-between gap-x-3 px-6 py-4 text-left capitalize text-white transition-all"
                  aria-controls={`faq-accordion-${index + 1}`}
                >
                  <h5 class="flex text-base font-semibold">
                    <i
                      data-lucide="help-circle"
                      class="me-3 h-5 w-5 stroke-white align-middle"
                    ></i>
                    {question.question}
                  </h5>
                  <i
                    data-lucide="chevron-up"
                    class="hs-accordion-active:-rotate-180 h-4 w-4 transition-all duration-500"
                  ></i>
                </button>
                <div
                  id={`faq-accordion-${index + 1}`}
                  class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300"
                  aria-labelledby={question.id}
                >
                  <div class="px-6 pb-4 pt-0">
                    <p class="text-default-300 mb-2 text-sm font-medium">
                      {question.answer}
                    </p>
                    <p class="text-default-300 text-sm font-medium">
                      
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
