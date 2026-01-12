import SayiDetayClient from "./SayiDetayClient";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const id = (sp?.id || "").trim();
  return <SayiDetayClient id={id} />;
}
