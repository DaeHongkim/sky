"use client";

import { useState } from "react";
import Button from "@/components/recruit/ui/Button";

export default function TalentBookmarkButton({
  jobSeekerId,
  initialBookmarked,
}: {
  jobSeekerId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/talents/${jobSeekerId}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={toggle}>
      {bookmarked ? "★ 북마크됨" : "☆ 북마크"}
    </Button>
  );
}
