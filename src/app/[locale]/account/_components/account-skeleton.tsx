import { Skeleton } from "@/components/ui/skeleton";
import MaxWidthWrapper from "@/components/max-width-wrapper";

export default function AccountSkeleton() {
  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
      <div className="mb-10">
        <Skeleton className="h-12 w-[200px] mx-auto mb-4" />
        <Skeleton className="h-5 w-[300px] mx-auto" />
      </div>
      <div className="mx-auto mb-10 sm:max-w-lg flex flex-col gap-10">
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-[150px] mx-auto mb-3" />
          <Skeleton className="h-5 w-[250px] mx-auto mb-6" />
          <Skeleton className="h-10 w-[200px] mx-auto" />
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-[150px] mx-auto mb-3" />
          <Skeleton className="h-5 w-[250px] mx-auto mb-6" />
          <Skeleton className="h-10 w-[200px] mx-auto" />
        </div>
        <div className="rounded-lg border p-6">
          <Skeleton className="h-7 w-[150px] mx-auto mb-3" />
          <Skeleton className="h-5 w-[250px] mx-auto mb-6" />
          <Skeleton className="h-5 w-[250px] mx-auto mb-6" />
          <Skeleton className="h-5 w-[250px] mx-auto mb-6" />
          <Skeleton className="h-10 w-[200px] mx-auto" />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}