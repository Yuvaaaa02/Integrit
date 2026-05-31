import { useEffect } from "react";
import { DEFAULT_META, removeMetaTag, setMetaTag } from "@/lib/meta";

type DocumentMetaOptions = {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
};

export function useDocumentMeta({
  title,
  description = DEFAULT_META.description,
  ogTitle,
  ogDescription,
  robots,
}: DocumentMetaOptions) {
  useEffect(() => {
    document.title = title;
    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", ogTitle ?? title);
    setMetaTag("property", "og:description", ogDescription ?? description);

    if (robots) {
      setMetaTag("name", "robots", robots);
    } else {
      removeMetaTag("name", "robots");
    }
  }, [description, ogDescription, ogTitle, robots, title]);
}
