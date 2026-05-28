"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, FileText, X, Loader2, Download, Send, Pencil, Trash2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { createClient } from "@/utils/supabase/client";

const servicesList = [
  {
    category: "Marketing & Automation",
    items: [
      "Organic Social Media Management",
      "Influencer Marketing",
      "Email & SMS Marketing",
      "Marketing Automation"
    ]
  },
  {
    category: "Branding & Creative",
    items: [
      "Branding & Visual Identity",
      "Content Creation",
      "Video Production & Animation",
      "Graphic Design"
    ]
  },
  {
    category: "SEO & Paid Ads",
    items: [
      "Search Engine Optimization (SEO)",
      "Local SEO",
      "Pay-Per-Click (PPC) Advertising",
      "Paid Social Advertising"
    ]
  },
  {
    category: "Web & Software Development",
    items: [
      "Website Design & Development",
      "Mobile App Development",
      "UX/UI Design",
      "Website Maintenance",
      "Software Development"
    ]
  },
  {
    category: "Strategy & Analytics",
    items: [
      "Conversion Rate Optimization (CRO)",
      "Data Analytics & Business Intelligence",
      "Market Research & Digital Strategy",
      "Online Reputation Management (ORM)"
    ]
  }
];

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
    service: "",
    customService: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientContact: "",
    clientWebsite: "",
    clientIndustry: "",
    clientTaxId: "",
    clientNotes: ""
  });
  const [clientMode, setClientMode] = useState<"select" | "create">("select");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [editingId, setEditingId] = useState<string | null>(null);

  const numberToWords = (num: number): string => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
    return str.trim();
  };

  const handleDownload = async (invoice: any) => {
    const { data: invData } = await supabase.from('invoices').select('*, clients(*)').eq('id', invoice.id).single();
    if (!invData) return;
    
    const client = invData.clients;
    const totalAmount = parseFloat(invData.total);
    const baseAmount = totalAmount / 1.18;
    const taxAmount = (totalAmount - baseAmount) / 2; // CGST and SGST

    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; background: white;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div>
            <h1 style="color: #7c3aed; font-size: 36px; margin: 0 0 20px 0; font-weight: normal;">Invoice</h1>
            <table style="font-size: 12px; line-height: 1.8;">
              <tr><td style="width: 100px;">Invoice No #</td><td><strong>${invoice.invoice_number}</strong></td></tr>
              <tr><td>Invoice Date</td><td><strong>${invoice.date.toUpperCase()}</strong></td></tr>
              <tr><td>Due Date</td><td><strong>${invoice.dueDate.toUpperCase()}</strong></td></tr>
            </table>
          </div>
          <div style="text-align: right;">
            <div style="width: 120px; height: 120px; background-color: #8b5cf6; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; margin-left: auto;">
              <span style="font-size: 32px; font-weight: bold; font-family: serif; line-height: 1;">Askus.</span>
              <span style="font-size: 10px; letter-spacing: 2px;">STUDIO</span>
            </div>
          </div>
        </div>

        <!-- Billed By / To -->
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
          <!-- Billed By -->
          <div style="flex: 1; background-color: #f3e8ff; padding: 20px; border-radius: 8px;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 16px; font-weight: normal;">Billed By</h3>
            <div style="font-size: 12px; line-height: 1.6;">
              <strong>Askus Studio</strong><br/>
              Lucknow, Uttar Pradesh, India<br/><br/>
              <table style="width: 100%;">
                <tr><td style="width: 60px;"><strong>GSTIN:</strong></td><td>09HOSPKS641L2Z0</td></tr>
                <tr><td><strong>PAN:</strong></td><td>HOSPKS641L</td></tr>
                <tr><td><strong>Phone:</strong></td><td>+91 80092 27002</td></tr>
              </table>
            </div>
          </div>
          <!-- Billed To -->
          <div style="flex: 1; background-color: #f3e8ff; padding: 20px; border-radius: 8px;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 16px; font-weight: normal;">Billed To <span style="color: #333; font-weight: bold;">${client.name}</span></h3>
            <div style="font-size: 12px; line-height: 1.6;">
              ${client.address ? client.address + '<br/><br/>' : '<br/>'}
              <table style="width: 100%;">
                <tr><td style="width: 60px;"><strong>GSTIN:</strong></td><td>${client.tax_id || '-'}</td></tr>
                <tr><td><strong>PAN:</strong></td><td>-</td></tr>
                <tr><td><strong>Phone:</strong></td><td>${client.phone || '-'}</td></tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background-color: #6d28d9; color: white;">
              <th style="padding: 12px; width: 30%;">Item</th>
              <th style="padding: 12px;">GST Rate</th>
              <th style="padding: 12px;">Quantity</th>
              <th style="padding: 12px;">Rate</th>
              <th style="padding: 12px;">Amount</th>
              <th style="padding: 12px;">CGST</th>
              <th style="padding: 12px;">SGST</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #e0f2fe;">
              <td style="padding: 12px;">1. ${invData.notes || 'Services Rendered'}</td>
              <td style="padding: 12px;">18%</td>
              <td style="padding: 12px;">1</td>
              <td style="padding: 12px;">₹ ${baseAmount.toFixed(2)}</td>
              <td style="padding: 12px;">₹ ${baseAmount.toFixed(2)}</td>
              <td style="padding: 12px;">₹ ${taxAmount.toFixed(2)}</td>
              <td style="padding: 12px;">₹ ${taxAmount.toFixed(2)}</td>
              <td style="padding: 12px; text-align: right;">₹ ${totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Bottom Details -->
        <div style="display: flex; gap: 20px; margin-bottom: 40px;">
          <!-- Bank Details -->
          <div style="flex: 1; background-color: #f3e8ff; padding: 20px; border-radius: 8px;">
            <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 14px; font-weight: normal;">Bank Details</h3>
            <table style="font-size: 11px; line-height: 1.8; width: 100%;">
              <tr><td style="width: 90px;"><strong>Account Name</strong></td><td>ASKUS STUDIO</td></tr>
              <tr><td><strong>Account Number</strong></td><td>59580200000288</td></tr>
              <tr><td><strong>IFSC</strong></td><td>BARB0MALLUC</td></tr>
              <tr><td><strong>Account Type</strong></td><td>CURRENT</td></tr>
              <tr><td><strong>Bank</strong></td><td>Bank of baroda</td></tr>
            </table>
          </div>
          
          <!-- UPI Scan -->
          <div style="flex: 1; text-align: center;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 14px; font-weight: normal;">Scan to pay via UPI</h3>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=askus@upi&pn=AskusStudio" alt="UPI QR Code" style="width: 100px; height: 100px; display: inline-block; border: 4px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1);" />
            <p style="font-size: 10px; margin-top: 5px;">vishwakarmakulbhushan-4@okaxis</p>
          </div>

          <!-- Total sum -->
          <div style="flex: 1.5;">
            <div style="border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 10px 0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: bold;">Total (INR)</span>
              <span style="font-size: 18px; font-weight: bold;">₹ ${totalAmount.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
            </div>
            <p style="font-size: 11px; line-height: 1.5; padding-right: 10px;">Total (in words) : ${numberToWords(Math.round(totalAmount))} Rupees Only</p>
          </div>
        </div>

        <!-- Footer terms -->
        <div style="font-size: 10px; color: #666; margin-bottom: 30px;">
          <p style="font-weight: bold; color: #333; margin-bottom: 5px;">Payment Terms</p>
          <p>50% advance to start → 50% after completion</p>
          <p>Work begins immediately after receiving the initial payment</p>
          <p>Payments can be made via UPI, Bank Transfer, or Invoice Link.</p>
        </div>

        <!-- Footer bottom line -->
        <div style="border-top: 1px dashed #ccc; padding-top: 20px; display: flex; justify-content: space-between; font-size: 9px; color: #666; text-transform: uppercase;">
          <div style="display: flex; gap: 40px;">
            <div>
              Invoice No<br/>
              <strong style="color: #333; font-size: 11px;">${invoice.invoice_number}</strong>
            </div>
            <div>
              Invoice Date<br/>
              <strong style="color: #333; font-size: 11px;">${invoice.date.toUpperCase()}</strong>
            </div>
            <div>
              Billed To<br/>
              <strong style="color: #333; font-size: 11px;">${client.name}</strong>
            </div>
          </div>
          <div style="text-align: right; text-transform: none; display: flex; align-items: flex-end;">
            This is an electronically generated document, no signature is required.
          </div>
        </div>

      </div>
    `;
    
    const opt = {
      margin: 10,
      filename: `${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleSend = (invoice: any) => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`);
    const body = encodeURIComponent(`Hello,\n\nPlease find the details for Invoice ${invoice.invoice_number}.\n\nAmount: ${invoice.amount}\nDue Date: ${invoice.dueDate}\n\nThank you.`);
    
    // Open Gmail compose window specifically
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    
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
        status: inv.status,
        notes: inv.notes
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
    const flatServices = servicesList.flatMap(group => group.items);
    const isPredefined = invoice.notes && flatServices.includes(invoice.notes);

    setNewInvoice({
      client: invoice.client_id,
      clientName: invoice.client,
      amount: invoice.rawAmount?.toString() || "",
      currency: "₹",
      dueDate: invoice.rawDueDate || "",
      service: invoice.notes ? (isPredefined ? invoice.notes : "Other") : "",
      customService: invoice.notes && !isPredefined ? invoice.notes : "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      clientContact: "",
      clientWebsite: "",
      clientIndustry: "",
      clientTaxId: "",
      clientNotes: ""
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
          address: newInvoice.clientAddress,
          contact: newInvoice.clientContact,
          website: newInvoice.clientWebsite,
          industry: newInvoice.clientIndustry,
          tax_id: newInvoice.clientTaxId,
          notes: newInvoice.clientNotes
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
    } else if (newInvoice.clientEmail || newInvoice.clientPhone || newInvoice.clientAddress || newInvoice.clientContact || newInvoice.clientWebsite || newInvoice.clientIndustry || newInvoice.clientTaxId || newInvoice.clientNotes) {
      // Sync info to existing client
      await supabase.from('clients').update({
        ...(newInvoice.clientEmail && { email: newInvoice.clientEmail }),
        ...(newInvoice.clientPhone && { phone: newInvoice.clientPhone }),
        ...(newInvoice.clientAddress && { address: newInvoice.clientAddress }),
        ...(newInvoice.clientContact && { contact: newInvoice.clientContact }),
        ...(newInvoice.clientWebsite && { website: newInvoice.clientWebsite }),
        ...(newInvoice.clientIndustry && { industry: newInvoice.clientIndustry }),
        ...(newInvoice.clientTaxId && { tax_id: newInvoice.clientTaxId }),
        ...(newInvoice.clientNotes && { notes: newInvoice.clientNotes }),
      }).eq('id', clientId);
    }

    if (!clientId) return;

    const chosenService = newInvoice.service === "Other" ? newInvoice.customService : newInvoice.service;

    const invoiceData = {
      client_id: clientId,
      invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      total: parseFloat(newInvoice.amount) || 0,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: newInvoice.dueDate || new Date().toISOString().split('T')[0],
      status: editingId ? undefined : "Draft", // preserve status on edit
      notes: chosenService || null
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
    setNewInvoice({ 
      client: "", 
      clientName: "", 
      amount: "", 
      currency: "₹", 
      dueDate: "", 
      service: "", 
      customService: "", 
      clientEmail: "", 
      clientPhone: "", 
      clientAddress: "",
      clientContact: "",
      clientWebsite: "",
      clientIndustry: "",
      clientTaxId: "",
      clientNotes: ""
    });
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
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{invoice.invoice_number}</span>
                        {invoice.notes && <span className="text-xs text-violet-500 font-semibold mt-0.5">{invoice.notes}</span>}
                      </div>
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
                          ...(invoice.status !== "Paid" ? [{ label: "Mark Paid", icon: CheckCircle2, variant: "success" as const, onClick: () => handleStatusChange(invoice.id, "Paid") }] : []),
                          ...(invoice.status === "Paid" ? [{ label: "Mark Unpaid", icon: XCircle, onClick: () => handleStatusChange(invoice.id, "Draft") }] : []),
                          ...(invoice.status === "Sent" ? [{ label: "Mark Unsent", icon: RotateCcw, onClick: () => handleStatusChange(invoice.id, "Draft") }] : []),
                          { label: "Delete", icon: Trash2, variant: "danger" as const, onClick: () => handleDelete(invoice.id) },
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
              <button 
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setNewInvoice({ 
                    client: "", 
                    clientName: "", 
                    amount: "", 
                    currency: "₹", 
                    dueDate: "", 
                    service: "", 
                    customService: "", 
                    clientEmail: "", 
                    clientPhone: "", 
                    clientAddress: "",
                    clientContact: "",
                    clientWebsite: "",
                    clientIndustry: "",
                    clientTaxId: "",
                    clientNotes: ""
                  });
                  setClientMode("select");
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                {clientMode === "select" ? (
                  <>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
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
                  </>
                ) : (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                        <input 
                          required 
                          type="text" 
                          placeholder="Jashn E Adab"
                          value={newInvoice.clientName} 
                          onChange={e => setNewInvoice({...newInvoice, clientName: e.target.value})} 
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" 
                        />
                      </div>
                      <button type="button" onClick={() => { setClientMode("select"); setNewInvoice({...newInvoice, clientName: ""}); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors mb-[1px]">Cancel</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                        <input type="text" placeholder="Ranjeet Singh" value={newInvoice.clientContact} onChange={e => setNewInvoice({...newInvoice, clientContact: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" placeholder="Jashneadab@gmail.com" value={newInvoice.clientEmail} onChange={e => setNewInvoice({...newInvoice, clientEmail: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input type="tel" placeholder="+91 93138 22799" value={newInvoice.clientPhone} onChange={e => setNewInvoice({...newInvoice, clientPhone: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                        <input type="text" placeholder="https://jashneadab.org/" value={newInvoice.clientWebsite} onChange={e => setNewInvoice({...newInvoice, clientWebsite: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                      <input type="text" placeholder="F-24, First Floor, Lajpat Nagar-2, New Delhi, India-110024" value={newInvoice.clientAddress} onChange={e => setNewInvoice({...newInvoice, clientAddress: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                        <input type="text" placeholder="Event" value={newInvoice.clientIndustry} onChange={e => setNewInvoice({...newInvoice, clientIndustry: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / GST</label>
                        <input type="text" placeholder="Tax ID" value={newInvoice.clientTaxId} onChange={e => setNewInvoice({...newInvoice, clientTaxId: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                      <textarea placeholder="Notes..." value={newInvoice.clientNotes} onChange={e => setNewInvoice({...newInvoice, clientNotes: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none" rows={2} />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service *</label>
                <select
                  required
                  value={newInvoice.service}
                  onChange={e => setNewInvoice({...newInvoice, service: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none bg-white text-slate-800"
                >
                  <option value="">Select a service...</option>
                  {servicesList.map(group => (
                    <optgroup key={group.category} label={group.category} className="font-semibold text-slate-500 bg-white">
                      {group.items.map(item => (
                        <option key={item} value={item} className="text-slate-800 font-normal">{item}</option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="Other" className="text-violet-600 font-semibold bg-violet-50">Other (Enter Manually)...</option>
                </select>
              </div>

              {newInvoice.service === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Service Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter custom service name"
                    value={newInvoice.customService}
                    onChange={e => setNewInvoice({...newInvoice, customService: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none text-slate-800 bg-white"
                  />
                </div>
              )}

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
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setNewInvoice({ 
                      client: "", 
                      clientName: "", 
                      amount: "", 
                      currency: "₹", 
                      dueDate: "", 
                      service: "", 
                      customService: "", 
                      clientEmail: "", 
                      clientPhone: "", 
                      clientAddress: "",
                      clientContact: "",
                      clientWebsite: "",
                      clientIndustry: "",
                      clientTaxId: "",
                      clientNotes: ""
                    });
                    setClientMode("select");
                  }} 
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 transition-colors">{editingId ? "Save Changes" : "Create Invoice"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
