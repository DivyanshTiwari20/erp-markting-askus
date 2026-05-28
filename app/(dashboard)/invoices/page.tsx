"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, FileText, X, Loader2, Download, Send, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { createClient } from "@/utils/supabase/client";

const statusStyles = {
  Paid: "bg-teal-50 text-teal-600 ring-1 ring-teal-500/20",
  Sent: "bg-violet-50 text-violet-600 ring-1 ring-blue-600/20",
  Draft: "bg-slate-100 text-slate-600 ring-1 ring-zinc-600/20",
  Overdue: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
};

export default function InvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ 
    client: "", 
    amount: "", 
    currency: "₹", 
    dueDate: "", 
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: ""
  });
  const [clientMode, setClientMode] = useState<"select" | "create">("select");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDownload = async (invoice: any) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #334155;">
        <h1 style="color: #8b5cf6; margin-bottom: 20px;">INVOICE ${invoice.invoice_number}</h1>
        <p><strong>Status:</strong> ${invoice.status}</p>
        <p><strong>Client:</strong> ${invoice.client}</p>
        <p><strong>Issue Date:</strong> ${invoice.date}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
          <h2>Total Amount: ${invoice.amount}</h2>
        </div>
      </div>
    `;
    html2pdf().from(element).save(`${invoice.invoice_number}.pdf`);
  };

  const handleSend = (invoice: any) => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`);
    const body = encodeURIComponent(`Hello,\n\nPlease find the details for Invoice ${invoice.invoice_number}.\n\nAmount: ${invoice.amount}\nDue Date: ${invoice.dueDate}\n\nThank you.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    handleStatusChange(invoice.id, 'Sent');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
    if (!error) fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [invoicesRes, clientsRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').order('name')
    ]);
    
    if (!invoicesRes.error) {
      setInvoices(invoicesRes.data.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_id: inv.client_id,
        client: inv.clients?.name || "Unknown",
        amount: `₹${inv.total}`,
        rawAmount: inv.total,
        date: new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDate: inv.issue_date,
        dueDate: new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawDueDate: inv.due_date,
        status: inv.status
      })));
    }
    
    if (!clientsRes.error) {
      setClients(clientsRes.data);
    }
    setIsLoading(false);
  };

  const currencies = [
    { symbol: "₹", label: "INR (₹)" },
    { symbol: "$", label: "USD ($)" },
    { symbol: "€", label: "EUR (€)" },
    { symbol: "£", label: "GBP (£)" }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === "All Statuses" || invoice.status === statusFilter;
    
    let matchesTime = true;
    if (timeFilter !== "All Time") {
      const invoiceDate = new Date(invoice.rawDate);
      const now = new Date();
      
      if (timeFilter === "This Month") {
        matchesTime = invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === "Last Month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        matchesTime = invoiceDate.getMonth() === lastMonth.getMonth() && invoiceDate.getFullYear() === lastMonth.getFullYear();
      } else if (timeFilter === "This Year") {
        matchesTime = invoiceDate.getFullYear() === now.getFullYear();
      }
    }
    
    return matchesStatus && matchesTime;
  });

  const handleEdit = (invoice: any) => {
    setNewInvoice({
      client: invoice.client_id,
      clientName: invoice.client,
      amount: invoice.rawAmount?.toString() || "",
      currency: "₹",
      dueDate: invoice.rawDueDate || "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: ""
    });
    setEditingId(invoice.id);
    setClientMode("select");
    setIsModalOpen(true);
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.amount) return;

    let clientId = newInvoice.client;

    if (clientMode === "create" && newInvoice.clientName) {
      const { data: newClientData, error: clientErr } = await supabase
        .from('clients')
        .insert([{ 
          name: newInvoice.clientName, 
          status: 'Active',
          email: newInvoice.clientEmail,
          phone: newInvoice.clientPhone,
          address: newInvoice.clientAddress
        }])
        .select()
        .single();
        
      if (!clientErr && newClientData) {
        clientId = newClientData.id;
        setClients([...clients, newClientData]);
      } else {
        console.error("Failed to create client:", clientErr);
        return;
      }
    } else if (newInvoice.clientEmail || newInvoice.clientPhone || newInvoice.clientAddress) {
      // Sync info to existing client
      await supabase.from('clients').update({
        ...(newInvoice.clientEmail && { email: newInvoice.clientEmail }),
        ...(newInvoice.clientPhone && { phone: newInvoice.clientPhone }),
        ...(newInvoice.clientAddress && { address: newInvoice.clientAddress }),
      }).eq('id', clientId);
    }

    if (!clientId) return;

    const invoiceData = {
      client_id: clientId,
      invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      total: parseFloat(newInvoice.amount) || 0,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: newInvoice.dueDate || new Date().toISOString().split('T')[0],
      status: editingId ? undefined : "Draft" // preserve status on edit
    };

    if (editingId) {
      const { invoice_number, issue_date, status, ...updateData } = invoiceData;
      const { error } = await supabase.from('invoices').update(updateData).eq('id', editingId);
      if (!error) fetchData();
      setEditingId(null);
    } else {
      const { error } = await supabase.from('invoices').insert([invoiceData]);
      if (!error) fetchData();
    }
    
    setIsModalOpen(false);
    setNewInvoice({ client: "", clientName: "", amount: "", currency: "₹", dueDate: "", clientEmail: "", clientPhone: "", clientAddress: "" });
    setClientMode("select");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) {
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 p-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">Create, send, and track invoices for your clients.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600 focus:outline-none"
        >
          <Plus className="h-5 w-5" /> Create Invoice
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option>All Statuses</option> <option>Paid</option>
              <option>Sent</option> <option>Draft</option>
              <option>Overdue</option>
            </select>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option>All Time</option> <option>This Month</option>
              <option>Last Month</option> <option>This Year</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-[#fdfbf7]/50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">Invoice ID</th>
                <th className="px-6 py-4 font-medium text-slate-400">Client</th>
                <th className="px-6 py-4 font-medium text-slate-400">Amount</th>
                <th className="px-6 py-4 font-medium text-slate-400">Issued / Due</th>
                <th className="px-6 py-4 font-medium text-slate-400">Status</th>
                <th className="px-6 py-4 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-[#fdfbf7]/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                        <FileText className="h-5 w-5 text-violet-500" />
                      </div>
                      <span className="font-medium text-slate-800">{invoice.invoice_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{invoice.client}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{invoice.date}</div>
                    <div className="text-xs text-slate-400">Due {invoice.dueDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[invoice.status as keyof typeof statusStyles]}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionMenu 
                        actions={[
                          { label: "Edit", icon: Pencil, onClick: () => handleEdit(invoice) },
                          { label: "Download PDF", icon: Download, onClick: () => handleDownload(invoice) },
                          { label: "Send Email", icon: Send, onClick: () => handleSend(invoice) },
                          { label: "Mark Paid", icon: CheckCircle2, variant: "success", onClick: () => handleStatusChange(invoice.id, "Paid") },
                          { label: "Delete", icon: Trash2, variant: "danger", onClick: () => handleDelete(invoice.id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Invoice" : "Create Invoice"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                {clientMode === "select" ? (
                  <div className="flex gap-2">
                    <select 
                      required
                      value={newInvoice.client} 
                      onChange={e => setNewInvoice({...newInvoice, client: e.target.value})} 
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none bg-white"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => { setClientMode("create"); setNewInvoice({...newInvoice, client: "", clientName: ""}); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">New Client</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter new client name"
                      value={newInvoice.clientName} 
                      onChange={e => setNewInvoice({...newInvoice, clientName: e.target.value})} 
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" 
                    />
                    <button type="button" onClick={() => { setClientMode("select"); setNewInvoice({...newInvoice, clientName: ""}); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client Email (Optional)</label>
                  <input type="email" placeholder="client@example.com" value={newInvoice.clientEmail} onChange={e => setNewInvoice({...newInvoice, clientEmail: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client Phone (Optional)</label>
                  <input type="tel" placeholder="+1 234 567 890" value={newInvoice.clientPhone} onChange={e => setNewInvoice({...newInvoice, clientPhone: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Address (Optional)</label>
                <input type="text" placeholder="123 Main St, City, Country" value={newInvoice.clientAddress} onChange={e => setNewInvoice({...newInvoice, clientAddress: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
                <div className="flex gap-2">
                  <select 
                    value={newInvoice.currency}
                    onChange={e => setNewInvoice({...newInvoice, currency: e.target.value})}
                    className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none bg-white"
                  >
                    {currencies.map(c => <option key={c.symbol} value={c.symbol}>{c.label}</option>)}
                  </select>
                  <input required type="number" step="0.01" placeholder="0.00" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={newInvoice.dueDate} onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none text-slate-600 bg-white" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">{editingId ? "Save Changes" : "Create Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
