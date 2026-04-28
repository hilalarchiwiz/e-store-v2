import Error from "@/components/Error";
import './css/style.css'

import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Error Page | NextCommerce Nextjs E-commerce template",
    description: "This is Error Page for NextCommerce Template",
    // other metadata
};

const ErrorPage = () => {
    return (
        <main>
            <Error />
        </main>
    );
};

export default ErrorPage;
