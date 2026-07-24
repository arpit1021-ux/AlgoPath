"use client";

export function SpaceBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: "#1a1a1a",
      }}
    >
      {/* Subtle orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{
          top: "10%",
          left: "15%",
          background: "radial-gradient(circle, rgba(255,161,22,0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "orbDrift1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.02]"
        style={{
          bottom: "15%",
          right: "10%",
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(120px)",
          animation: "orbDrift2 30s ease-in-out infinite",
        }}
      />
    </div>
  );
}
