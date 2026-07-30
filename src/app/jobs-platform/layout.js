import "./jobs-platform.css";

export const metadata = {
  title: "Jobs Platform - Vantage Point",
  description: "AI-Powered Job Matching and CV Security Verification Platform",
};

export default function JobsPlatformLayout({ children }) {
  return (
    <div className="jobs-platform-wrapper">
      {children}
    </div>
  );
}
