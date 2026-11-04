import GermanLessonClient from "@/features/german-lesson/components/GermanLessonClient";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function GermanLessonPage() {
  return (
    <section className="min-h-screen bg-secondary py-8 pt-24">
      <div className="mx-auto max-w-[95%] p-3 md:max-w-2xl">
        <Suspense
          fallback={
            <div className="flex justify-center py-24">
              <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
            </div>
          }
        >
          <GermanLessonClient />
        </Suspense>
      </div>
    </section>
  );
}
