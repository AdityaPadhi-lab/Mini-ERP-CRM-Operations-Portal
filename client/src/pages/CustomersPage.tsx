import { useMemo, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, Pencil, Plus, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Pagination } from '../components/ui/pagination';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '../components/ui/states';

import { useAuth } from '../hooks/useAuth';
import { date, initials } from '../lib/utils';
import { ApiError } from '../services/api';
import {
  customerService,
  type CustomerInput,
} from '../services/customer.service';

import type {
  Customer,
  CustomerStatus,
  CustomerType,
} from '../types';

import { useToast } from '../components/ToastProvider';

const schema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  businessName: z.string().min(2, 'Business name is required'),
  mobileNumber: z.string().min(7, 'Valid mobile number is required'),
  email: z.string().email('Enter a valid email address'),
  gstNumber: z.string().optional(),
  customerType: z.enum([
    'RETAIL',
    'WHOLESALE',
    'DISTRIBUTOR',
  ]),
  status: z.enum([
    'LEAD',
    'ACTIVE',
    'INACTIVE',
  ]),
  address: z.string().min(5, 'Address is required'),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  customerName: '',
  businessName: '',
  mobileNumber: '',
  email: '',
  gstNumber: '',
  customerType: 'WHOLESALE',
  status: 'LEAD',
  address: '',
  followUpDate: '',
  notes: '',
};

const statusTone: Record<
  CustomerStatus,
  'success' | 'warning' | 'danger'
> = {
  ACTIVE: 'success',
  LEAD: 'warning',
  INACTIVE: 'danger',
};

export function CustomerForm({
  customer,
  onClose,
}: {
  customer?: Customer;
  onClose: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: customer
      ? {
          customerName: customer.customerName,
          businessName: customer.businessName,
          mobileNumber: customer.mobileNumber,
          email: customer.email,
          gstNumber: customer.gstNumber ?? '',
          customerType: customer.customerType,
          status: customer.status,
          address: customer.address,
          followUpDate:
            customer.followUpDate?.slice(0, 10) ?? '',
          notes: customer.notes ?? '',
        }
      : defaults,
  });

  const client = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input: CustomerInput = {
        ...values,
        gstNumber: values.gstNumber || null,
        followUpDate: values.followUpDate || null,
        notes: values.notes || null,
      };

      return customer
        ? customerService.update(customer.id, input)
        : customerService.create(input);
    },

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ['customers'],
      });

      if (customer) {
        client.invalidateQueries({
          queryKey: ['customer', customer.id],
        });
      }

      client.invalidateQueries({
        queryKey: ['dashboard'],
      });

      toast.success(
        customer
          ? 'Customer updated'
          : 'Customer created',
      );

      onClose();
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'Could not save customer',
      );
    },
  });

  const errorMessage = (
    name: keyof FormValues,
  ) => form.formState.errors[name]?.message;

  const submit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog
      open
      title={
        customer
          ? 'Edit customer'
          : 'Add customer'
      }
      description="Keep customer and business information current."
      onClose={onClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={mutation.isPending}
            onClick={form.handleSubmit(submit)}
          >
            {customer
              ? 'Save changes'
              : 'Create customer'}
          </Button>
        </>
      }
    >
      <form
        className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
        onSubmit={form.handleSubmit(submit)}
      >
        <Field
          label="Customer name"
          required
          error={errorMessage('customerName')}
        >
          <input
            className="field-control"
            placeholder="e.g. Anil Gupta"
            {...form.register('customerName')}
          />
        </Field>

        <Field
          label="Business name"
          required
          error={errorMessage('businessName')}
        >
          <input
            className="field-control"
            placeholder="e.g. ABC Traders"
            {...form.register('businessName')}
          />
        </Field>

        <Field
          label="Mobile number"
          required
          error={errorMessage('mobileNumber')}
        >
          <input
            className="field-control"
            placeholder="+91 98765 43210"
            {...form.register('mobileNumber')}
          />
        </Field>

        <Field
          label="Email"
          required
          error={errorMessage('email')}
        >
          <input
            className="field-control"
            type="email"
            placeholder="contact@business.com"
            {...form.register('email')}
          />
        </Field>

        <Field label="Customer type">
          <select
            className="field-control"
            {...form.register('customerType')}
          >
            <option value="RETAIL">
              Retail
            </option>

            <option value="WHOLESALE">
              Wholesale
            </option>

            <option value="DISTRIBUTOR">
              Distributor
            </option>
          </select>
        </Field>

        <Field label="Status">
          <select
            className="field-control"
            {...form.register('status')}
          >
            <option value="LEAD">
              Lead
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </Field>

        <Field label="GST number">
          <input
            className="field-control"
            placeholder="Optional"
            {...form.register('gstNumber')}
          />
        </Field>

        <Field label="Next follow-up">
          <input
            className="field-control"
            type="date"
            {...form.register('followUpDate')}
          />
        </Field>

        <Field
          label="Business address"
          required
          error={errorMessage('address')}
          className="sm:col-span-2"
        >
          <textarea
            className="field-control h-20 py-2.5"
            placeholder="Street, city, state and postcode"
            {...form.register('address')}
          />
        </Field>

        <Field
          label="Notes"
          className="sm:col-span-2"
        >
          <textarea
            className="field-control h-20 py-2.5"
            placeholder="Internal notes"
            {...form.register('notes')}
          />
        </Field>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="field-label">
        {label}

        {required && (
          <span className="text-red-600">
            {' '}
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function CustomersPage() {
  const { can } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] =
    useState<CustomerStatus | ''>('');
  const [customerType, setCustomerType] =
    useState<CustomerType | ''>('');

  const [editing, setEditing] =
    useState<Customer | undefined>();

  const [open, setOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      status: status || undefined,
      customerType:
        customerType || undefined,
    }),
    [
      page,
      search,
      status,
      customerType,
    ],
  );

  const query = useQuery({
    queryKey: ['customers', filters],
    queryFn: () =>
      customerService.list(filters),
  });

  const clear = () => {
    setSearch('');
    setStatus('');
    setCustomerType('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Manage relationships, contacts and follow-up activity."
        actions={
          can('ADMIN', 'SALES') ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add customer
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="surface flex items-center gap-3 p-4">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
            <Users className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Customer base
            </p>

            <p className="metric-value mt-0.5 text-xl font-extrabold text-slate-900">
              {query.data?.pagination.total ?? '—'}
            </p>
          </div>
        </div>

        <div className="surface p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Status filter
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {status || 'All customers'}
          </p>
        </div>

        <div className="surface p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Type filter
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {customerType || 'All types'}
          </p>
        </div>
      </div>

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              className="field-control pl-9"
              placeholder="Search name, business, phone or email…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="field-control lg:w-40"
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value as
                  | CustomerStatus
                  | '',
              );

              setPage(1);
            }}
          >
            <option value="">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="LEAD">
              Lead
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

          <select
            className="field-control lg:w-44"
            value={customerType}
            onChange={(event) => {
              setCustomerType(
                event.target.value as
                  | CustomerType
                  | '',
              );

              setPage(1);
            }}
          >
            <option value="">
              All types
            </option>

            <option value="RETAIL">
              Retail
            </option>

            <option value="WHOLESALE">
              Wholesale
            </option>

            <option value="DISTRIBUTOR">
              Distributor
            </option>
          </select>
        </div>

        {query.isLoading ? (
          <TableSkeleton />
        ) : query.isError || !query.data ? (
          <ErrorState
            message="We couldn't load your customer database."
            retry={() => query.refetch()}
          />
        ) : query.data.data.length === 0 ? (
          <EmptyState
            title="No customers match"
            description="Clear the filters or add a new customer record."
            action={
              <Button
                onClick={() => {
                  clear();
                  setOpen(true);
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Customer
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Follow-up
                    </th>

                    <th className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {query.data.data.map(
                    (customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                              {initials(
                                customer.customerName,
                              )}
                            </div>

                            <div>
                              <Link
                                className="font-bold text-slate-800 hover:text-indigo-700 hover:underline"
                                to={`/customers/${customer.id}`}
                              >
                                {customer.customerName}
                              </Link>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {customer.businessName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <p className="text-slate-600">
                            {customer.mobileNumber}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {customer.email}
                          </p>
                        </td>

                        <td className="text-slate-600">
                          {customer.customerType}
                        </td>

                        <td>
                          <Badge
                            tone={
                              statusTone[
                                customer.status
                              ]
                            }
                          >
                            {customer.status}
                          </Badge>
                        </td>

                        <td className="whitespace-nowrap text-slate-500">
                          {date(
                            customer.followUpDate,
                          )}
                        </td>

                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/customers/${customer.id}`}
                              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Link>

                            {can(
                              'ADMIN',
                              'SALES',
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    customer,
                                  )
                                }
                                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              pagination={
                query.data.pagination
              }
              onChange={setPage}
            />
          </>
        )}
      </section>

      {open && (
        <CustomerForm
          customer={editing}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}