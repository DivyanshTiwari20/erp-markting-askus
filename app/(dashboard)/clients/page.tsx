"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, Mail, Phone, X, Loader2 } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ClientsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", contact: "", email: "", phone: "", address: "", website: "", industry: "", taxId: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*, invoices(total)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      const clientsWithTotal = (data || []).map(client => {
        const total = client.invoices?.reduce((acc: number, inv: any) => acc + (parseFloat(inv.total) || 0), 0) || 0;
        return {
          ...client,
          totalBilled: `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        };
      });
      setClients(clientsWithTotal);
    }
    setIsLoading(false);
  };

  const handleEdit = (client: any) => {
    setNewClient({
      name: client.name || "",
      contact: client.contact || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      website: client.website || "",
      industry: client.industry || "",
      taxId: client.tax_id || "",
      notes: client.notes || "",
    });
    setEditingId(client.id);
    setIsModalOpen(true);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    const clientData = {
      name: newClient.name,
      contact: newClient.contact,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      website: newClient.website,
      industry: newClient.industry,
      tax_id: newClient.taxId,
      notes: newClient.notes,
    };

    if (editingId) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingId);
        
      if (!error) {
        setClients(clients.map(c => c.id === editingId ? { ...c, ...clientData } : c));
      }
      setEditingId(null);
    } else {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, status: 'Active' }])
        .select()
        .single();
        
      if (!error && data) {
        setClients([data, ...clients]);
      }
    }
    
    setIsModalOpen(false);
    setNewClient({ name: "", contact: "", email: "", phone: "", address: "", website: "", industry: "", taxId: "", notes: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 p-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Clients</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your agency's clients and billing details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-600 focus:outline-none"
        >
          <Plus className="h-5 w-5" /> Add Client
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-[#fdfbf7]/50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-400">Company</th>
                <th className="px-6 py-4 font-medium text-slate-400">Contact</th>
                <th className="px-6 py-4 font-medium text-slate-400">Status</th>
                <th className="px-6 py-4 font-medium text-slate-400">Total Billed</th>
                <th className="px-6 py-4 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Loader2 className="h-6 w-6 animate-spin text-violet-500" /></div>
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="transition-colors hover:bg-[#fdfbf7]/50 cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <span className="font-medium text-slate-800">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{client.contact}</p>
                      <div className="mt-1 flex flex-col gap-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {client.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${client.status === "Active" ? "bg-teal-50 text-teal-600 ring-1 ring-teal-500/20" : "bg-slate-100 text-slate-600 ring-1 ring-zinc-600/20"}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{client.totalBilled || "₹0.00"}</td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu 
                      onEdit={() => handleEdit(client)} 
                      onDelete={() => handleDelete(client.id)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Client" : "Add New Client"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input required type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                <input type="text" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input type="text" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input type="url" value={newClient.website} onChange={e => setNewClient({...newClient, website: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <input type="text" value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / GST</label>
                <input type="text" value={newClient.taxId} onChange={e => setNewClient({...newClient, taxId: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                <textarea rows={2} value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">{editingId ? "Save Changes" : "Save Client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
