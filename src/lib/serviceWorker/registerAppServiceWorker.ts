let registrationPromise: Promise<ServiceWorkerRegistration> | null = null;

/** Single registration for /sw.js (PWA + push). Safe to call from multiple clients. */
export function registerAppServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!registrationPromise) {
        registrationPromise = navigator.serviceWorker
            .register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            })
            .catch((error) => {
                registrationPromise = null;
                throw error;
            });
    }
    return registrationPromise;
}
