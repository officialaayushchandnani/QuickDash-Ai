import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

// FIX: Define the shape of the props our component expects.
// This tells TypeScript that onSave and onCancel are functions with specific signatures.
interface AddAddressFormProps {
  onSave: (address: { name: string; address: string; landmark: string; phone: string }) => void;
  onCancel: () => void;
}

// FIX: Apply the props type to the component using React.FC
export const AddAddressForm: React.FC<AddAddressFormProps> = ({ onSave, onCancel }) => {
  const [address, setAddress] = useState({ name: '', address: '', landmark: '', phone: '' });

  // FIX: Add the correct event type for the 'e' parameter.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!address.name || !address.address || !address.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSave(address);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add a New Delivery Address</DialogTitle>
        <DialogDescription>
          Enter your address details below. This will be saved for future orders.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Address Nickname (e.g., Home, Work)*</Label>
          <Input id="name" value={address.name} onChange={handleChange} placeholder="Home"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address*</Label>
          <Input id="address" value={address.address} onChange={handleChange} placeholder="123, Main Street, Jodhpur" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="landmark">Landmark</Label>
          <Input id="landmark" value={address.landmark} onChange={handleChange} placeholder="Near Clock Tower"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number*</Label>
          <Input id="phone" type="tel" value={address.phone} onChange={handleChange} placeholder="+91 98765 43210"/>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Address</Button>
      </DialogFooter>
    </DialogContent>
  );
};