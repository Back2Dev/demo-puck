"use server";

import { savePage } from "../lib/db";
import { revalidatePath } from "next/cache";

export async function publishPage(path: string, data: any) {
  await savePage(path, data);
  revalidatePath(path);
}
