"use client";

import { registerAppServiceWorker } from "@/lib/serviceWorker/registerAppServiceWorker";
import { useEffect } from "react";

const SeviceWorker = () => {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return;

        registerAppServiceWorker().catch((error) => {
            console.warn("SW registration failed:", error);
        });
    }, []);

    return null;
};

export default SeviceWorker;
