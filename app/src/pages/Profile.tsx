import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Lock, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: user?.name?.first || '',
    lastName: user?.name?.last || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    isDefault: false,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddresses([...addresses, newAddress]);
    setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
    toast.success('Address added');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <div className="flex items-center gap-5 mb-10">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-9 w-9 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-normal text-foreground">{user?.fullName}</h1>
            <p className="text-sm font-sans text-muted-foreground mt-1">{user?.email}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-cream-100 border border-border rounded-sm p-1">
            <TabsTrigger value="profile" className="font-sans text-sm data-[state=active]:bg-white rounded-sm gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="font-sans text-sm data-[state=active]:bg-white rounded-sm gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="security" className="font-sans text-sm data-[state=active]:bg-white rounded-sm gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="orders" className="font-sans text-sm data-[state=active]:bg-white rounded-sm gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="border border-border rounded-sm p-6">
              <h2 className="text-xl font-serif font-medium mb-6">Personal Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                      First Name
                    </label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                      Last Name
                    </label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <div key={index} className="border border-border rounded-sm p-5">
                  <div className="flex justify-between items-start">
                    <div className="font-sans text-sm">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                      {address.isDefault && (
                        <span className="inline-block mt-2 text-[10px] font-sans font-semibold tracking-wider uppercase bg-primary text-primary-foreground px-3 py-1 rounded-sm">
                          Default
                        </span>
                      )}
                    </div>
                    <button className="text-xs font-sans text-primary hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
              ))}

              <div className="border border-border rounded-sm p-6">
                <h3 className="text-lg font-serif font-medium mb-5">Add New Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                      Street Address
                    </label>
                    <Input
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">City</label>
                      <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">State</label>
                      <Input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">Country</label>
                      <Input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">ZIP Code</label>
                      <Input value={newAddress.zipCode} onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })} className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm" required />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground px-6 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
                  >
                    Add Address
                  </button>
                </form>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="border border-border rounded-sm p-6">
              <h2 className="text-xl font-serif font-medium mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="bg-cream-50 border-border font-sans text-sm h-11 rounded-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
                >
                  Change Password
                </button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="border border-border rounded-sm p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-base font-sans text-muted-foreground mb-5">
                View all your orders in one place
              </p>
              <button
                onClick={() => window.location.href = '/orders'}
                className="bg-primary text-primary-foreground px-6 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-primary/90 transition-all"
              >
                View My Orders
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
