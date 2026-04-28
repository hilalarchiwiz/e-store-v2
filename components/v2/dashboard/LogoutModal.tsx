"use client";

import React, { useEffect } from "react";
import Button from "@/components/v2/Button";
import { motion, AnimatePresence } from "framer-motion";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-[#1a251d] rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-primary/10"
            >
              <div className="p-8 md:p-10 text-center">
                {/* Icon */}
                <div className="size-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/5">
                  <span className="material-symbols-outlined !text-4xl">
                    logout
                  </span>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-black text-[#121714] dark:text-white mb-3">
                  Wait! Going so soon?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                  Are you sure you want to log out? We'll miss having you around
                  to help save the planet!
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={onClose}
                    className="!py-4"
                  >
                    Stay here
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={onConfirm}
                    className="!bg-red-500 hover:!bg-red-600 !shadow-red-500/20 !py-4"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
