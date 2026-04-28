"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/user-slice";

export default function SyncUser({ session }: { session: any }) {
    const dispatch = useDispatch();
    useEffect(() => {
        if (session?.user) {
            dispatch(setUser({
                name: session.user.name,
                id: session.user.id,
                email: session.user.email,
                image: session.user.image
            }));
        }
    }, [session, dispatch]);

    return null;
}