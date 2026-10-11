import { useEffect, useRef } from "react";
import data from "@emoji-mart/data";
import { Picker } from "emoji-mart";

const EmojiPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(onSelect);

  useEffect(() => {
    latest.current = onSelect;
  });

  useEffect(() => {
    const el = host.current;
    const picker = new Picker({
      data,
      theme: "light",
      onEmojiSelect: (e: { native: string }) => latest.current(e.native),
    });
    el?.appendChild(picker as unknown as Node);
    return () => el?.replaceChildren();
  }, []);

  return <div ref={host} />;
};

export default EmojiPicker;