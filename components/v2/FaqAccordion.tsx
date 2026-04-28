'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqs }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={faq.id} 
          className={`
            group rounded-3xl border transition-all duration-300
            ${activeIndex === index 
              ? 'bg-white dark:bg-[#1a251d] border-primary shadow-xl scale-[1.01]' 
              : 'bg-[#f1f4f2] dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10 shadow-none'
            }
          `}
        >
          <button
            onClick={() => toggleAccordion(index)}
            className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4"
          >
            <span className={`
              text-lg md:text-xl font-black transition-colors duration-300
              ${activeIndex === index ? 'text-primary' : 'text-[#121714] dark:text-white'}
            `}>
              {faq.question}
            </span>
            <div className={`
              flex-shrink-0 size-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${activeIndex === index ? 'bg-primary text-white rotate-180' : 'bg-white dark:bg-white/10 text-gray-400 rotate-0'}
            `}>
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </button>
          
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto no-scrollbar">
                  <div 
                    className="px-6 md:px-8 pb-8 text-gray-500 dark:text-gray-400 leading-relaxed font-medium prose dark:prose-invert max-w-none break-words
                      prose-img:rounded-2xl prose-img:max-w-full prose-img:h-auto
                      prose-pre:overflow-x-auto prose-pre:max-w-full
                      prose-table:overflow-x-auto prose-table:block prose-table:w-full"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
