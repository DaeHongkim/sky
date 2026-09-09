"use client";

import { useState } from "react";
import Button from "@/components/recruit/ui/Button";

export default function ScrapButton({
  jobPostId,
  initialScrapped,
}: {
  jobPostId: string;
  initialScrapped: boolean;
}) {
  const [scrapped, setScrapped] = useState(initialScrapped);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/job-posts/${jobPostId}/scrap`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setScrapped(data.scrapped);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={toggle}>
      {scrapped ? "★ 스크랩됨" : "☆ 스크랩"}
    </Button>
  );
}
