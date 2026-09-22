import webpush from "web-push";

const VAPID_SUBJECT = "mailto:yousefmahmoud150@gmail.com";

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey =
    process.env.VAPID_PRIVATE_KEY ?? process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.");
  }

  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
  return webpush;
}
