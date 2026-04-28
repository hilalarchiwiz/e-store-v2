'use client'

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // The onConfirm handler passed here will now be the one from DeleteButton, 
    // which handles the loading state and closure itself.
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    // New props for loading/disabling state
    isConfirmDisabled?: boolean; // To disable the confirmation button
    isCancelDisabled?: boolean;  // To disable the cancel button (usually when loading)
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm, // We will call this directly from the button
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isConfirmDisabled = false, // Default to false
    isCancelDisabled = false   // Default to false
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                onClick={() => {
                    // Prevent closing via backdrop click if cancellation is disabled (i.e., deleting)
                    if (!isCancelDisabled) {
                        onClose();
                    }
                }}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-600" />
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Confirm Delete
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Are you sure you want to delete this item? This data will be loss and not return .
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">

                        {/* Confirm Button */}
                        <button
                            onClick={onConfirm} // Call parent's handler, which manages loading and closing
                            disabled={isConfirmDisabled} // Disable while loading
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all active:scale-95"
                        // className={`flex-1 px-4 py-2.5 cursor-pointer text-sm font-medium text-white rounded-lg transition-colors 
                        //     ${isConfirmDisabled
                        //         ? 'bg-red-400 cursor-not-allowed'
                        //         : 'bg-red-600 hover:bg-red-700'
                        //     }`}
                        >
                            {confirmText}
                        </button>

                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            disabled={isCancelDisabled} // Disable while loading
                            // className={`flex-1 cursor-pointer px-4 py-2.5 text-sm font-medium rounded-lg transition-colors 
                            //     ${isCancelDisabled
                            //         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            //         : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            //     }`}

                            className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all"
                        >
                            {cancelText}
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
} 