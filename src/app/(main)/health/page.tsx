import HealthPageClient from "@/features/health/components/HealthPageClient";

export default function HealthPage() {
  return (
    <section className="min-h-screen bg-secondary py-8 pt-5">
      <div className="mx-auto max-w-[95%] rounded-2xl p-3 md:max-w-2xl">
        <HealthPageClient />
      </div>
    </section>
  );
}
