import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toKebabCase = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]>[] => {
  const groupedDataKeys: string[] = [];
  const groupedData = new Map<string, T[]>();

  array.forEach((item) => {
    const value = item[key];
    let valueStr: string;
    if (typeof value === "string") {
      valueStr = value;
    } else if (typeof value === "number") {
      valueStr = value.toString();
    } else {
      return;
    }

    if (groupedData.has(valueStr)) {
      groupedData.get(valueStr)?.push(item);
    } else {
      groupedData.set(valueStr, [item]);
      groupedDataKeys.push(valueStr);
    }
  });

  return groupedDataKeys.map((key) => ({
    [key]: groupedData.get(key),
  })) as Record<string, T[]>[];
};
