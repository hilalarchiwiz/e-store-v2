'use client';
import { Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";

const FaqContent = ({ faq, faqs }) => {
    const [openIndex, setOpenIndex] = useState(0);
    const contentRefs = useRef([]);
    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div
            key={faq.id}
            className={`border-b border-gray-200 ${faq.id === faqs.length - 1 ? 'border-b-0' : ''
                }`}
        >
            <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
                <span className="text-base font-medium text-gray-900 pr-8">
                    {faq.question}
                </span>
                <span className="flex-shrink-0">
                    <div className={`transform transition-transform duration-300 ${openIndex === faq.id ? 'rotate-180' : ''}`}>
                        {openIndex === faq.id ? (
                            <Minus className="w-5 h-5 text-gray-500" />
                        ) : (
                            <Plus className="w-5 h-5 text-gray-500" />
                        )}
                    </div>
                </span>
            </button>

            <div
                ref={el => contentRefs.current[faq.id] = el}
                style={{
                    maxHeight: openIndex === faq.id ? `${contentRefs.current[faq.id]?.scrollHeight}px` : '0px',
                }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
            >
                <div className="px-6 pb-5">
                    <div
                        className="prose prose-slate lg:prose-lg max-w-none 
                                   prose-headings:text-slate-900 prose-headings:font-bold
                                   prose-p:text-slate-600 prose-p:leading-relaxed
                                   prose-strong:text-slate-900 wrap-break-word whitespace-normal"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FaqContent;