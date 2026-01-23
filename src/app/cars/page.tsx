"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

function CarsPageContent() {
  const router = useRouter();
  
  // Always redirect to homepage
  useEffect(() => {
    router.push("/");
  }, [router]);

  return null; // Don't render anything while redirecting
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarsPageContent />
    </Suspense>
  );
}
