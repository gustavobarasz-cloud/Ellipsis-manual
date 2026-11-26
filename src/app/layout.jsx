import "./globals.css";

export const metadata = {
  title: "Behavioral Intelligence Workstation (6MX + Ellipsis Manual)",
  description:
    "12-module syntopical behavioral intelligence curriculum with interactive simulators, calibration labs, and epistemic science drawers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
