/**
 * Clerk's widget restyled to AlgoPath's palette so sign-in doesn't look like a
 * third-party form dropped into the page. Values mirror the tokens in
 * globals.css rather than repeating hex codes, so a theme change carries here.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#ffa116",
    colorBackground: "#252525",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "rgba(255,255,255,0.07)",
    colorInputText: "#e2e8f0",
    colorDanger: "#ef4444",
    colorSuccess: "#2cbb5d",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-transparent shadow-none border-0 p-0",

    // The shell above the widget already says AlgoPath; Clerk's own header
    // would repeat it.
    header: "hidden",

    socialButtonsBlockButton:
      "border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-colors",
    socialButtonsBlockButtonText: "text-[#e2e8f0] font-medium",

    dividerLine: "bg-[rgba(255,255,255,0.1)]",
    dividerText: "text-[#64748b]",

    formFieldLabel: "text-[#94a3b8] font-medium",
    formFieldInput:
      "bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.1)] text-[#e2e8f0] focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] transition-colors",

    formButtonPrimary:
      "bg-[#ffa116] hover:brightness-110 text-[#1a1a1a] font-semibold normal-case text-sm transition-all",

    footerActionText: "text-[#64748b]",
    footerActionLink: "text-[#ffa116] hover:text-[#ffb347] font-medium",

    identityPreviewEditButton: "text-[#ffa116]",
    formResendCodeLink: "text-[#ffa116]",
    otpCodeFieldInput: "border-[rgba(255,255,255,0.15)] text-[#e2e8f0]",

    // "Secured by Clerk". Removing Clerk's branding is a paid-plan feature —
    // check your plan before shipping this hidden.
    footer: "hidden",
  },
  layout: {
    socialButtonsPlacement: "top",
    showOptionalFields: false,
  },
  // `as const` keeps socialButtonsPlacement a literal rather than widening it
  // to string, which Clerk's prop type rejects.
} as const;
