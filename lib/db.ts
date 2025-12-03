import clientPromise from "./mongodb";
import { initialData } from "../config/initial-data";
import fs from "fs/promises";
import path from "path";

const uri = process.env.DATABASE_URI || "";

function generateRandomId(length: number) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const getPage = async (pagePath: string) => {
  if (uri.startsWith("file://")) {
    try {
      const filePath = path.resolve(process.cwd(), uri.replace("file://", ""));
      
      const fileExists = await fs
        .stat(filePath)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return initialData[pagePath] || null;
      }

      const fileContent = await fs.readFile(filePath, "utf-8");
      const db = JSON.parse(fileContent);
      return db[pagePath] || initialData[pagePath] || null;
    } catch (error) {
      console.error("Error reading DB file:", error);
      return null;
    }
  } else {
    try {
      const client = await clientPromise;
      const db = client.db();
      const page = await db.collection("pages").findOne({ path: pagePath });

      if (!page) {
        return initialData[pagePath] || null;
      }

      const { _id, path: p, ...rest } = page;
      return rest;
    } catch (error) {
      console.error("Error reading DB:", error);
      return null;
    }
  }
};

export const savePage = async (pagePath: string, data: any) => {
  if (uri.startsWith("file://")) {
    try {
      const filePath = path.resolve(process.cwd(), uri.replace("file://", ""));
      let db: Record<string, any> = {};
      
      const fileExists = await fs
        .stat(filePath)
        .then(() => true)
        .catch(() => false);
        
      if (fileExists) {
        const fileContent = await fs.readFile(filePath, "utf-8");
        db = JSON.parse(fileContent);
      }

      db[pagePath] = data;
      await fs.writeFile(filePath, JSON.stringify(db, null, 2));
    } catch (error) {
      console.error("Error saving to DB file:", error);
    }
  } else {
    try {
      const client = await clientPromise;
      const db = client.db();

      const existing = await db.collection("pages").findOne({ path: pagePath });

      if (existing) {
        await db.collection("pages").updateOne({ path: pagePath }, { $set: data });
      } else {
        const _id = generateRandomId(17);
        await db.collection("pages").insertOne({ _id, path: pagePath, ...data });
      }
    } catch (error) {
      console.error("Error saving to DB:", error);
    }
  }
};