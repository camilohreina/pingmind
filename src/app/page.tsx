import BadgeSale from "@/components/badge-sale";
import Features from "@/components/features";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Title from "@/components/title";

export default async function HomePage() {
  return (
    <MaxWidthWrapper className="flex flex-col items-center justify-center gap-24 text-center">
      <section>
        <BadgeSale />
        <Title />
      </section>
      <Features />
    </MaxWidthWrapper>
  );
}
