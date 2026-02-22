"use client";

import { useState, useEffect } from "react";
import { User, Building, Lock, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getSettingsData, updateProfile, updateClinic } from "@/actions/settings";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [profileData, setProfileData] = useState({ name: "", email: "", firebaseUid: "" });
    const [clinicData, setClinicData] = useState({ id: "", name: "", address: "", phone: "" });

    useEffect(() => {
        if (user) {
            fetchData(user.uid);
        }
    }, [user]);

    const fetchData = async (uid: string) => {
        setLoading(true);
        const result = await getSettingsData(uid);
        if (result.success && result.data) {
            setProfileData({
                name: result.data.name || "",
                email: result.data.email,
                firebaseUid: result.data.firebaseUid
            });
            if (result.data.clinic) {
                setClinicData({
                    id: result.data.clinic.id,
                    name: result.data.clinic.name,
                    address: result.data.clinic.address || "",
                    phone: result.data.clinic.phone || ""
                });
            }
        }
        setLoading(false);
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.append("firebaseUid", profileData.firebaseUid);
        formData.append("name", profileData.name);

        const result = await updateProfile(formData);
        if (result.success) {
            toast.success("Profile updated successfully");
        } else {
            toast.error("Failed to update profile: " + result.error);
        }
        setSaving(false);
    };

    const handleClinicSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.append("clinicId", clinicData.id);
        formData.append("name", clinicData.name);
        formData.append("address", clinicData.address);
        formData.append("phone", clinicData.phone);

        const result = await updateClinic(formData);
        if (result.success) {
            toast.success("Clinic details updated successfully");
        } else {
            toast.error("Failed to update clinic: " + result.error);
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Settings
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-1">
                    <Button
                        variant={activeTab === "profile" ? "secondary" : "ghost"}
                        className={`w-full justify-start ${activeTab === "profile" ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500"}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button
                        variant={activeTab === "clinic" ? "secondary" : "ghost"}
                        className={`w-full justify-start ${activeTab === "clinic" ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500"}`}
                        onClick={() => setActiveTab("clinic")}
                    >
                        <Building className="mr-2 h-4 w-4" /> Clinic Details
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-500" disabled>
                        <Lock className="mr-2 h-4 w-4" /> Security (Coming Soon)
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-slate-500" disabled>
                        <Bell className="mr-2 h-4 w-4" /> Notifications (Coming Soon)
                    </Button>
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-xl border shadow-sm">
                    {activeTab === "profile" && (
                        <form onSubmit={handleProfileSave}>
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Profile Settings</h3>
                            <div className="grid gap-4 max-w-md">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email Address</Label>
                                    <Input value={profileData.email} disabled className="bg-slate-50 text-slate-500" />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {activeTab === "clinic" && (
                        <form onSubmit={handleClinicSave}>
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Clinic Details</h3>
                            <div className="grid gap-4 max-w-md">
                                <div className="grid gap-2">
                                    <Label>Clinic Name</Label>
                                    <Input
                                        value={clinicData.name}
                                        onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={clinicData.address}
                                        onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={clinicData.phone}
                                        onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
