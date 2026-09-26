import SleepPageClient from "@/features/sleep/components/SleepPageClient";

export default function SleepPage() {
  return (
    <section className="min-h-screen bg-secondary py-8 pt-24">
      <div className="mx-auto max-w-[95%] rounded-2xl p-3 md:max-w-2xl">
        <SleepPageClient />
      </div>
    </section>
  );
}
