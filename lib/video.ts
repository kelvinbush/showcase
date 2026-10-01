export interface VideoEmbed {
  /** Where the video comes from, which decides how it can be controlled. */
  provider: "youtube" | "vimeo" | "file";
  /** YouTube: the video id. Otherwise: the address to load. */
  src: string;
  /** A poster we can derive without calling the provider's API, when one exists. */
  poster: string | null;
}

/** Turns a pasted video link into something playable, or null if the link is unusable. */
export function toEmbed(url: string): VideoEmbed | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be" || host.endsWith("youtube.com")) {
    const id =
      host === "youtu.be"
        ? parsed.pathname.slice(1)
        : (parsed.searchParams.get("v") ??
          parsed.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1]);
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return {
      provider: "youtube",
      src: id,
      poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.match(/(\d{6,})/)?.[1];
    if (!id) return null;
    return {
      provider: "vimeo",
      src: `https://player.vimeo.com/video/${id}?autoplay=1`,
      poster: null,
    };
  }

  return { provider: "file", src: parsed.toString(), poster: null };
}
