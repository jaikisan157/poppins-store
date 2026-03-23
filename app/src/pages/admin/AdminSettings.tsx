import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Store, Truck, CreditCard, Bell } from 'lucide-react';

export default function AdminSettings() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Poppins',
    storeEmail: 'support@poppins.com',
    storePhone: '+1 (555) 123-4567',
    currency: 'USD',
    timezone: 'America/New_York',
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 50,
    defaultShippingCost: 9.99,
    enableInternationalShipping: true,
    estimatedDeliveryDays: '7-14',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableStripe: true,
    enablePaypal: false,
    enableCod: true,
    testMode: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReports: false,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="store">
            <Store className="h-4 w-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="h-4 w-4 mr-2" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Store Name</Label>
                  <Input
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, storeName: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Store Email</Label>
                  <Input
                    value={storeSettings.storeEmail}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, storeEmail: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Store Phone</Label>
                  <Input
                    value={storeSettings.storePhone}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, storePhone: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Currency</Label>
                  <Input
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, currency: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('Store')}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Shipping Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Free Shipping Threshold ($)</Label>
                  <Input
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        freeShippingThreshold: parseFloat(e.target.value),
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Default Shipping Cost ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shippingSettings.defaultShippingCost}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        defaultShippingCost: parseFloat(e.target.value),
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Estimated Delivery Days</Label>
                <Input
                  value={shippingSettings.estimatedDeliveryDays}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      estimatedDeliveryDays: e.target.value,
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={shippingSettings.enableInternationalShipping}
                  onCheckedChange={(checked) =>
                    setShippingSettings({
                      ...shippingSettings,
                      enableInternationalShipping: checked,
                    })
                  }
                />
                <Label className="text-slate-300">Enable International Shipping</Label>
              </div>
              <Button onClick={() => handleSave('Shipping')}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Stripe</p>
                    <p className="text-sm text-slate-400">Credit/Debit card payments</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableStripe}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, enableStripe: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">PayPal</p>
                    <p className="text-sm text-slate-400">PayPal payments</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enablePaypal}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, enablePaypal: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Cash on Delivery</p>
                    <p className="text-sm text-slate-400">Pay when you receive</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCod}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({ ...paymentSettings, enableCod: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={paymentSettings.testMode}
                  onCheckedChange={(checked) =>
                    setPaymentSettings({ ...paymentSettings, testMode: checked })
                  }
                />
                <Label className="text-slate-300">Test Mode</Label>
              </div>
              <Button onClick={() => handleSave('Payment')}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive email notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Order Notifications</p>
                    <p className="text-sm text-slate-400">Get notified for new orders</p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        orderNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-slate-400">Get alerts when stock is low</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        lowStockAlerts: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Daily Reports</p>
                    <p className="text-sm text-slate-400">Receive daily summary reports</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        dailyReports: checked,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('Notification')}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
