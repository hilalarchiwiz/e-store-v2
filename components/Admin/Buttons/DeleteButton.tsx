'use client'

import { Trash2, Loader2 } from "lucide-react"; // Import Loader2 for the loading spinner
import ConfirmDialog from "../ConfirmDialog"
import { useState } from "react";
import toast from "react-hot-toast";

export type DeleteButtonProps = {
    id: string,
    // The action should be async since it calls a Server Button
    action: (id: string) => Promise<any>
}

const DeleteButton = ({ id, action }: DeleteButtonProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    // State to track the loading status during the deletion process
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsDeleting(true); // 1. Start loading state

        try {
            // 2. Await the asynchronous action (e.g., deleteProduct)
            const result = await action(id);

            // Optional: Handle the result if your action returns success/failure objects
            if (result && result.success === false) {
                // You might show a toast notification here
                console.error("Deletion failed:", result.message);
                toast.error(result.message);
            }
            else {
                // You might show a toast notification here
                console.log("Deletion successful");
                toast.success("Item deleted successfully.");
            }

        } catch (error) {
            // Handle unexpected errors (e.g., network issues)
            console.error('Unexpected error during deletion:', error);
            toast.error('An unexpected error occurred during deletion.');
        } finally {
            // 3. Stop loading state, regardless of success or failure
            setIsDeleting(false);

            // 4. Hide the modal only after the action is complete (or failed)
            setIsDeleteDialogOpen(false);
        }
    };

    // Determine the button content based on the loading state
    const deleteButtonContent = isDeleting ? (
        <Loader2 className="size-3 animate-spin" />
    ) : (
        <Trash2 className="size-3" />
    );

    return (
        <>
            <button
                onClick={() => isDeleteDialogOpen ? setIsDeleteDialogOpen(false) : setIsDeleteDialogOpen(true)}
                className="bg-red-500  hover:bg-red-600 text-white p-2 rounded transition-colors"
                title="Delete"
                disabled={isDeleting} // Disable the trash icon button while deleting
            >
                {deleteButtonContent}
            </button>

            {/* The ConfirmDialog component */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    // Prevent closing the modal if the deletion is in progress
                    if (!isDeleting) {
                        setIsDeleteDialogOpen(false);
                    }
                }}
                onConfirm={handleDelete}
                title={`Delete item ${id}`}
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText={isDeleting ? 'Deleting...' : 'Delete'} // Update text during loading
                cancelText="Cancel"
                isConfirmDisabled={isDeleting} // Disable the confirmation button during loading
                isCancelDisabled={isDeleting}  // Disable the cancel button during loading
            />
        </>
    )
}

export default DeleteButton