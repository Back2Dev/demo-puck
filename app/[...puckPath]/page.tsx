import resolvePuckPath from "../../lib/resolve-puck-path";
import { Metadata } from "next";
import Client from "./client";
import { getPage } from "../../lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const { isEdit, path } = resolvePuckPath(puckPath);

  const data = await getPage(path);

  if (isEdit) {
    return {
      title: "Editing: " + path,
    };
  }

  return {
    title: data?.root?.props?.title || data?.root?.title || "Puck Page",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const { isEdit, path } = resolvePuckPath(puckPath);

  const data = await getPage(path);

  return <Client isEdit={isEdit} path={path} initialData={data || {}} />;
}
