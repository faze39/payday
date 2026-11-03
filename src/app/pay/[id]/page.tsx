import { PayFlow } from "@/components/PayFlow";

export default async function PayPage({ params, searchParams }: PageProps<"/pay/[id]">) {
  const { id } = await params;
  const { a } = await searchParams;
  return <PayFlow linkId={id} initialAttemptId={typeof a === "string" ? a : null} />;
}
