import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import RoleGate from "@/components/layout/RoleGate";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfbf7]">
      {" "}
      <Sidebar />{" "}
      <div className="flex flex-1 flex-col overflow-hidden">
        {" "}
        <Topbar />{" "}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <RoleGate>{children}</RoleGate>
        </main>{" "}
      </div>{" "}
    </div>
  );
}
