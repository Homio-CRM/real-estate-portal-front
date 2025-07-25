"use client";

export default function LoadingModal() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="flex flex-col items-center justify-center">
        <span className="relative flex h-20 w-20">
          <span className="animate-spin inline-block w-full h-full rounded-full border-8 border-solid border-primary border-t-transparent"></span>
        </span>
      </div>
    </div>
  );
} 