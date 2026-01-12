import YaziDetayClient from "./YaziDetayClient";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const id = (sp?.id || "").trim();

  return <YaziDetayClient id={id} />;
}
