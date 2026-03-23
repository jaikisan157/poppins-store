import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import type { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Mail, Flag, Eye, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;

      const response = await adminApi.getCustomers(params);
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlag = async (customerId: string, flagged: boolean) => {
    try {
      await adminApi.flagCustomer(customerId, { isFlagged: flagged, flagReason: flagged ? 'Suspicious activity' : '' });
      toast.success(flagged ? 'Customer flagged' : 'Customer unflagged');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to update flag status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Total Customers</p>
            <p className="text-2xl font-bold text-white">{customers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Flagged</p>
            <p className="text-2xl font-bold text-white">{customers.filter(c => c.flagged).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Customer</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Location</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Orders</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Spent</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Source</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer._id} className="border-b border-slate-800">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{customer.fullName}</p>
                            <p className="text-sm text-slate-400">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {customer.location?.country || 'Unknown'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">{customer.totalOrders || 0}</td>
                      <td className="py-4 px-6 text-white font-medium">
                        ${customer.totalSpent || '0.00'}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {customer.utmData?.source || 'Direct'}
                      </td>
                      <td className="py-4 px-6">
                        {customer.flagged ? (
                          <Badge variant="destructive">Flagged</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                              <DialogHeader>
                                <DialogTitle>Customer Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
                                    <User className="h-8 w-8 text-slate-400" />
                                  </div>
                                  <div>
                                    <p className="text-xl font-bold">{customer.fullName}</p>
                                    <p className="text-slate-400">{customer.email}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-slate-400">Total Orders</p>
                                    <p className="text-lg font-medium">{customer.totalOrders || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Total Spent</p>
                                    <p className="text-lg font-medium">${customer.totalSpent || '0.00'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Location</p>
                                    <p className="text-lg font-medium">{customer.location?.country || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-400">Source</p>
                                    <p className="text-lg font-medium">{customer.utmData?.source || 'Direct'}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant={customer.flagged ? 'default' : 'destructive'}
                                    onClick={() => handleFlag(customer._id, !customer.flagged)}
                                  >
                                    <Flag className="h-4 w-4 mr-2" />
                                    {customer.flagged ? 'Unflag' : 'Flag'}
                                  </Button>
                                  <Button variant="outline">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Message
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFlag(customer._id, !customer.flagged)}
                            className={customer.flagged ? 'text-green-500' : 'text-orange-500'}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
