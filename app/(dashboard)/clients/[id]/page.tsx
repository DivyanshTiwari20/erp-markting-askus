import { ArrowLeft, Building2, Mail, Phone, MapPin, Globe, Briefcase, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

const dummyHistory = [
  { id: 1, type: "Invoice", title: "Invoice INV-2026-050 created", date: "Apr 15, 2026", amount: "₹3,200.00" },
  { id: 2, type: "Payment", title: "Payment received for INV-2026-048", date: "Apr 02, 2026", amount: "₹4,500.00" },
  { id: 3, type: "Retainer", title: "SEO Foundation retainer renewed", date: "Apr 01, 2026", amount: null },
  { id: 4, type: "Note", title: "Kickoff call completed successfully", date: "Mar 28, 2026", amount: null },
];

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from('clients')
    .select('*, invoices(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !client) {
    notFound();
  }

  const total = client.invoices?.reduce((acc: number, inv: any) => acc + (parseFloat(inv.total) || 0), 0) || 0;
  client.totalBilled = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const clientHistory = (client.invoices || [])
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((inv: any) => ({
      id: inv.id,
      type: "Invoice",
      title: `Invoice ${inv.invoice_number} created`,
      date: new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `₹${parseFloat(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }));

  const displayHistory = clientHistory.length > 0 ? clientHistory : [];

  return (
    <div className="space-y-8 p-8 flex-1">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{client.name}</h1>
          <p className="mt-1 text-sm text-slate-400">Client Profile & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{client.name}</h2>
                <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${client.status === "Active" ? "bg-teal-50 text-teal-600 ring-1 ring-teal-500/20" : "bg-slate-100 text-slate-600 ring-1 ring-zinc-600/20"}`}>
                  {client.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{client.contact || "No contact name"}</p>
                  <p className="text-xs text-slate-500">Primary Contact</p>
                </div>
              </div>
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <a href={`mailto:${client.email}`} className="text-sm font-medium text-violet-600 hover:underline">{client.email}</a>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <a href={`tel:${client.phone}`} className="text-sm font-medium text-slate-800 hover:underline">{client.phone}</a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{client.address || "No address provided"}</p>
                </div>
              </div>
              {client.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-violet-600 hover:underline">{client.website}</a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Client Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Industry</p>
                  <p className="text-sm font-medium text-slate-800">{client.industry || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tax ID</p>
                  <p className="text-sm font-medium text-slate-800">{client.tax_id || "-"}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-xs text-slate-500 mb-1">Total Billed</p>
                  <p className="text-lg font-bold text-slate-800">{client.totalBilled || "₹0.00"}</p>
                </div>
              </div>
            </div>

            {client.notes && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Internal Notes</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-500" />
                Activity History
              </h2>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-slate-100">
                {displayHistory.length === 0 ? (
                  <li className="p-6 text-center text-slate-500 text-sm">No activity history found.</li>
                ) : displayHistory.map((item: any, index: number) => (
                  <li key={item.id} className="p-6 transition-colors hover:bg-[#fdfbf7]/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.type === "Payment" ? "bg-teal-50 text-teal-600" : item.type === "Invoice" ? "bg-violet-50 text-violet-600" : "bg-slate-100 text-slate-500"}`}>
                          {item.type === "Invoice" ? <FileText className="h-5 w-5" /> : 
                           item.type === "Payment" ? <span className="font-bold text-lg">₹</span> : 
                           <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.type} • {item.date}</p>
                        </div>
                      </div>
                      {item.amount && (
                        <div className="text-right">
                          <span className={`text-sm font-bold ${item.type === "Payment" ? "text-teal-600" : "text-slate-800"}`}>
                            {item.type === "Payment" ? "+" : ""}{item.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
