import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { EmptyState, ErrorState, TableSkeleton } from '../components/ui/states';
import { challanService, type ChallanInput } from '../services/challan.service';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { ApiError } from '../services/api';
import { currency, date } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ToastProvider';
import type { ChallanStatus } from '../types';

const tone: Record<ChallanStatus,'info'|'success'|'danger'> = { DRAFT:'info', CONFIRMED:'success', CANCELLED:'danger' };

type Line = { productId: string; quantity: number };
function CreateChallan({ onClose }: { onClose: () => void }) {
  const customers = useQuery({ queryKey:['customers-challan'], queryFn: () => customerService.list({ page:1, limit:100 }) });
  const products = useQuery({ queryKey:['products-challan'], queryFn: () => productService.list({ page:1, limit:100 }) });
  const [customerId,setCustomerId]=useState(''); const [lines,setLines]=useState<Line[]>([{productId:'',quantity:1}]);
  const client=useQueryClient(); const toast=useToast();
  const mutation=useMutation({mutationFn:()=>challanService.create({customerId,status:'DRAFT',items:lines.filter(x=>x.productId)}),onSuccess:(c)=>{client.invalidateQueries({queryKey:['challans']});client.invalidateQueries({queryKey:['dashboard']});toast.success(`${c.challanNumber} created as draft`);onClose();},onError:e=>toast.error(e instanceof ApiError?e.message:'Could not create challan')});
  const add=()=>setLines(l=>[...l,{productId:'',quantity:1}]); const remove=(i:number)=>setLines(l=>l.filter((_,idx)=>idx!==i)); const update=(i:number,key:keyof Line,value:string)=>setLines(l=>l.map((x,idx)=>idx===i?{...x,[key]:key==='quantity'?Math.max(1,Number(value)):value}:x));
  const total=lines.reduce((s,l)=>s+l.quantity,0);
  return <Dialog open title="Create sales challan" description="Build a dispatch document. Confirmation deducts stock atomically." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={mutation.isPending} disabled={!customerId||!lines.some(l=>l.productId)} onClick={()=>mutation.mutate()}>Save draft</Button></>}>
    <div className="space-y-5"><div><label className="field-label">Customer</label><select className="field-control" value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Select customer</option>{customers.data?.data.map(c=><option key={c.id} value={c.id}>{c.customerName} · {c.businessName}</option>)}</select></div><div><div className="mb-2 flex items-center justify-between"><label className="field-label mb-0">Items</label><span className="text-xs font-bold text-slate-400">{total} units</span></div><div className="space-y-2">{lines.map((line,i)=><div className="grid grid-cols-[1fr_90px_36px] gap-2" key={i}><select className="field-control" value={line.productId} onChange={e=>update(i,'productId',e.target.value)}><option value="">Select product</option>{products.data?.data.map(p=><option key={p.id} value={p.id}>{p.productName} · {currency(p.unitPrice)} · {p.currentStock} available</option>)}</select><input className="field-control" type="number" min="1" value={line.quantity} onChange={e=>update(i,'quantity',e.target.value)} /><button className="grid h-10 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600" disabled={lines.length===1} onClick={()=>remove(i)} aria-label="Remove item"><Trash2 className="h-4 w-4" /></button></div>)}</div><Button variant="secondary" size="sm" className="mt-3" onClick={add}><Plus className="h-3.5 w-3.5" />Add item</Button></div></div>
  </Dialog>;
}

export function ChallansPage(){
 const {can}=useAuth(); const [page,setPage]=useState(1); const [search,setSearch]=useState(''); const [status,setStatus]=useState<ChallanStatus|''>(''); const [create,setCreate]=useState(false);
 const filters=useMemo(()=>({page,limit:12,search:search||undefined,status:status||undefined}),[page,search,status]); const data=useQuery({queryKey:['challans',filters],queryFn:()=>challanService.list(filters)});
 return <><PageHeader eyebrow="Dispatch" title="Sales Challans" description="Create, review and control customer dispatch documents." actions={can('ADMIN','SALES')?<Button onClick={()=>setCreate(true)}><Plus className="h-4 w-4"/>New challan</Button>:undefined}/>
 <section className="surface overflow-hidden"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input className="field-control pl-9" placeholder="Search challan or customer…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></div><select className="field-control lg:w-44" value={status} onChange={e=>{setStatus(e.target.value as ChallanStatus|'');setPage(1)}}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option></select></div>
 {data.isLoading?<TableSkeleton/>:data.isError||!data.data?<ErrorState message="We couldn't load sales challans." retry={()=>data.refetch()}/>:data.data.data.length===0?<EmptyState title="No challans found" description="Create a draft challan when you're ready to prepare a customer dispatch." action={can('ADMIN','SALES')?<Button onClick={()=>setCreate(true)}><Plus className="h-4 w-4"/>New challan</Button>:undefined}/>:<div className="table-wrap"><table className="data-table"><thead><tr><th>Challan</th><th>Customer</th><th>Items</th><th className="text-right">Quantity</th><th>Status</th><th>Created</th><th/></tr></thead><tbody>{data.data.data.map(c=><tr key={c.id}><td><Link to={`/challans/${c.id}`} className="font-bold text-indigo-700 hover:underline">{c.challanNumber}</Link></td><td><p className="font-semibold text-slate-800">{c.customer.customerName}</p><p className="text-xs text-slate-400">{c.customer.businessName}</p></td><td className="text-slate-600">{c._count?.items??0}</td><td className="text-right font-bold tabular-nums">{c.totalQuantity}</td><td><Badge tone={tone[c.status]}>{c.status}</Badge></td><td className="text-xs text-slate-500">{date(c.createdAt)}</td><td className="text-right"><Link className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100" to={`/challans/${c.id}`}><Eye className="h-3.5 w-3.5"/>View</Link></td></tr>)}</tbody></table></div>}
 </section>{data.data&&data.data.pagination.totalPages>1&&<div className="mt-4 flex justify-end gap-2"><Button variant="secondary" size="sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button><span className="flex h-8 items-center px-2 text-xs font-semibold text-slate-500">Page {page} of {data.data.pagination.totalPages}</span><Button variant="secondary" size="sm" disabled={page>=data.data.pagination.totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button></div>}{create&&<CreateChallan onClose={()=>setCreate(false)}/>}</>;
}
