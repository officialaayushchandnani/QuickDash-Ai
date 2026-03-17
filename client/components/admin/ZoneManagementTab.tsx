import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/adminService";
import { Zone } from "@/types";
import { toast } from "sonner";
import { Plus, MapPin, Settings } from "lucide-react";

const EMPTY_ZONE_FORM = { name: "", area: "", deliveryTime: "", radius: "" };

export function ZoneManagementTab() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [newZone, setNewZone] = useState(EMPTY_ZONE_FORM);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  useEffect(() => {
    const fetchZones = async () => {
      setIsLoading(true);
      try {
        const data = await api.getZones();
        setZones(data);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
        toast.error("Could not load delivery zone data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchZones();
  }, []);

  const handleAddZone = () => {
    if (!newZone.name || !newZone.area) {
      toast.error("Zone Name and Area are required.");
      return;
    }
    const zoneToAdd: Zone = {
      ...newZone,
      id: `zone_${Date.now()}`,
      orders: 0,
      isActive: true,
    };
    setZones(prev => [zoneToAdd, ...prev]);
    toast.success("Delivery zone added successfully!");
    setNewZone(EMPTY_ZONE_FORM);
    setAddOpen(false);
  };
  
  const handleUpdateZone = () => {
    if (!editingZone) return;
    setZones(zones.map(z => z.id === editingZone.id ? editingZone : z));
    toast.success("Delivery zone updated successfully!");
    setEditingZone(null);
    setEditOpen(false);
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading delivery zones...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Delivery Zones - Ahmedabad</h2>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{zone.name}</CardTitle>
                  <CardDescription>{zone.area}</CardDescription>
                </div>
                <Badge variant={zone.isActive ? "default" : "secondary"}>
                  {zone.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Delivery Time:</span><span>{zone.deliveryTime}</span></div>
                <div className="flex justify-between"><span>Coverage:</span><span>{zone.radius}</span></div>
                <div className="flex justify-between"><span>Orders:</span><span>{zone.orders}</span></div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1"><MapPin className="w-4 h-4 mr-2" />View Map</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingZone(zone); setEditOpen(true); }}>
                  <Settings className="w-4 h-4 mr-2" />Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Delivery Zone</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Zone Name *</Label><Input value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} /></div>
            <div><Label>Area *</Label><Input value={newZone.area} onChange={e => setNewZone({...newZone, area: e.target.value})} /></div>
            <div><Label>Delivery Time</Label><Input value={newZone.deliveryTime} onChange={e => setNewZone({...newZone, deliveryTime: e.target.value})} /></div>
            <div><Label>Radius</Label><Input value={newZone.radius} onChange={e => setNewZone({...newZone, radius: e.target.value})} /></div>
            <div className="flex gap-2 justify-end pt-2"><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={handleAddZone}>Add Zone</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        {editingZone && (
          <DialogContent>
            <DialogHeader><DialogTitle>Edit {editingZone.name}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Zone Name *</Label><Input value={editingZone.name} onChange={e => setEditingZone({...editingZone, name: e.target.value})} /></div>
              <div><Label>Area *</Label><Input value={editingZone.area} onChange={e => setEditingZone({...editingZone, area: e.target.value})} /></div>
              <div><Label>Delivery Time</Label><Input value={editingZone.deliveryTime} onChange={e => setEditingZone({...editingZone, deliveryTime: e.target.value})} /></div>
              <div><Label>Radius</Label><Input value={editingZone.radius} onChange={e => setEditingZone({...editingZone, radius: e.target.value})} /></div>
              <div className="flex gap-2 justify-end pt-2"><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={handleUpdateZone}>Update Zone</Button></div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}