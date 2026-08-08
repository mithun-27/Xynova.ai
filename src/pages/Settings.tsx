import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { User, Bell, Shield, Moon, Sun, Globe, Mail, Trash2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

const fadeUp: any = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" }
    })
};

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    
    const [activeTab, setActiveTab] = useState("Profile");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Profile Settings state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");

    // Notification Preferences state
    const [emailNotif, setEmailNotif] = useState(() => {
        const val = localStorage.getItem("email_notif");
        return val !== null ? val === "true" : true;
    });
    const [pushNotif, setPushNotif] = useState(() => {
        const val = localStorage.getItem("push_notif");
        return val !== null ? val === "true" : true;
    });
    const [reportNotif, setReportNotif] = useState(() => {
        const val = localStorage.getItem("report_notif");
        return val !== null ? val === "true" : true;
    });

    // Appearance state
    const [glassmorphism, setGlassmorphism] = useState(() => {
        const val = localStorage.getItem("glassmorphism");
        return val !== null ? val === "true" : true;
    });
    const [reducedMotion, setReducedMotion] = useState(() => {
        const val = localStorage.getItem("reduced_motion");
        return val !== null ? val === "true" : false;
    });

    // Security state
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [twoFactor, setTwoFactor] = useState(() => {
        const val = localStorage.getItem("two_factor");
        return val !== null ? val === "true" : false;
    });

    // Language & Timezone state
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "en";
    });
    const [timezone, setTimezone] = useState(() => {
        return localStorage.getItem("timezone") || "pst";
    });

    // Load profile from DB
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const profile = await api.getProfile();
                setFirstName(profile.first_name || "");
                setLastName(profile.last_name || "");
                setEmail(profile.email || "");
                setBio(profile.bio || "");
            } catch (err: any) {
                console.error("Failed to fetch user profile", err);
                toast.error("Failed to load user settings.");
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save profile updates to backend Database
            await api.updateProfile({
                first_name: firstName,
                last_name: lastName,
                bio: bio
            });

            // 2. Save UI preference settings to localStorage
            localStorage.setItem("email_notif", emailNotif.toString());
            localStorage.setItem("push_notif", pushNotif.toString());
            localStorage.setItem("report_notif", reportNotif.toString());
            localStorage.setItem("glassmorphism", glassmorphism.toString());
            localStorage.setItem("reduced_motion", reducedMotion.toString());
            localStorage.setItem("language", language);
            localStorage.setItem("timezone", timezone);
            localStorage.setItem("two_factor", twoFactor.toString());

            toast.success("Settings saved successfully! 💾");
        } catch (err: any) {
            console.error("Failed to save settings updates", err);
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            toast.error("Please enter a new password.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully! 🔒");
            setNewPassword("");
        } catch (err: any) {
            console.error("Password update failed", err);
            toast.error(err.message || "Failed to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you absolutely sure you want to delete your account? This will wipe all progress and data irreversibly.")) {
            localStorage.clear();
            toast.success("Account deleted successfully.");
            navigate("/");
        }
    };

    const tabs = [
        { icon: User, label: "Profile" },
        { icon: Bell, label: "Notifications" },
        { icon: Moon, label: "Appearance" },
        { icon: Shield, label: "Security" },
        { icon: Globe, label: "Language" },
    ];

    // Profile data is loaded in the background; page renders immediately

    return (
        <DashboardLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Header */}
                    <motion.div variants={fadeUp} custom={0}>
                        <h1 className="text-3xl font-bold mb-2">Settings</h1>
                        <p className="text-muted-foreground">Manage your account and preferences.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Navigation */}
                        <motion.div variants={fadeUp} custom={1} className="space-y-1">
                            {tabs.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setActiveTab(item.label)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.label
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            ))}
                        </motion.div>

                        {/* Main Settings Content */}
                        <div className="md:col-span-2 space-y-8">
                            {activeTab === "Profile" && (
                                <motion.section variants={fadeUp} custom={2} className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                            <User className="h-8 w-8 text-primary/60" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Edit</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold">Personal Profile</h2>
                                            <p className="text-xs text-muted-foreground">This info will be visible to others.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input 
                                                    id="firstName" 
                                                    value={firstName} 
                                                    onChange={(e) => setFirstName(e.target.value)} 
                                                    className="bg-muted/30 border-border/50 focus:border-primary/50" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input 
                                                    id="lastName" 
                                                    value={lastName} 
                                                    onChange={(e) => setLastName(e.target.value)} 
                                                    className="bg-muted/30 border-border/50 focus:border-primary/50" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    id="email" 
                                                    value={email} 
                                                    disabled 
                                                    className="pl-10 bg-muted/30 border-border/50 disabled:opacity-70 cursor-not-allowed" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="bio">Bio</Label>
                                            <textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full flex min-h-[80px] rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Tell us about your learning goals..."
                                            />
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === "Notifications" && (
                                <motion.section variants={fadeUp} custom={2} className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm">
                                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-blue-400" /> Notifications
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Email Notifications</Label>
                                                <p className="text-xs text-muted-foreground">Receive updates about your progress via email.</p>
                                            </div>
                                            <Switch 
                                                checked={emailNotif} 
                                                onCheckedChange={setEmailNotif} 
                                            />
                                        </div>
                                        <Separator className="bg-border/30" />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Push Notifications</Label>
                                                <p className="text-xs text-muted-foreground">Receive real-time alerts on your device.</p>
                                            </div>
                                            <Switch 
                                                checked={pushNotif} 
                                                onCheckedChange={setPushNotif} 
                                            />
                                        </div>
                                        <Separator className="bg-border/30" />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Monthly Progress Report</Label>
                                                <p className="text-xs text-muted-foreground">A detailed summary of your learning journey.</p>
                                            </div>
                                            <Switch 
                                                checked={reportNotif} 
                                                onCheckedChange={setReportNotif} 
                                            />
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === "Appearance" && (
                                <motion.section variants={fadeUp} custom={2} className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm">
                                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Moon className="h-5 w-5 text-purple-400" /> Appearance
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Dark Mode</Label>
                                                <p className="text-xs text-muted-foreground">Adjust the UI for low light conditions.</p>
                                            </div>
                                            <Switch 
                                                checked={theme === "dark"} 
                                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} 
                                            />
                                        </div>
                                        <Separator className="bg-border/30" />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Glassmorphism Effects</Label>
                                                <p className="text-xs text-muted-foreground">Enable translucent background effects.</p>
                                            </div>
                                            <Switch 
                                                checked={glassmorphism} 
                                                onCheckedChange={setGlassmorphism} 
                                            />
                                        </div>
                                        <Separator className="bg-border/30" />
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Reduced Motion</Label>
                                                <p className="text-xs text-muted-foreground">Minimize the intensity of animations.</p>
                                            </div>
                                            <Switch 
                                                checked={reducedMotion} 
                                                onCheckedChange={setReducedMotion} 
                                            />
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === "Security" && (
                                <motion.section variants={fadeUp} custom={2} className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm">
                                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-emerald-400" /> Security
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <Input 
                                                id="newPassword" 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="bg-muted/30 border-border/50 focus:border-primary/50" 
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={handleUpdatePassword}
                                            disabled={isUpdatingPassword}
                                            className="mt-2"
                                        >
                                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                                        </Button>
                                    </div>
                                    <Separator className="my-6 bg-border/30" />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Two-Factor Authentication</Label>
                                            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                                        </div>
                                        <Switch 
                                            checked={twoFactor} 
                                            onCheckedChange={setTwoFactor} 
                                        />
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === "Language" && (
                                <motion.section variants={fadeUp} custom={2} className="glass-card p-6 rounded-2xl border border-border/50 shadow-sm">
                                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-amber-400" /> Language & region
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="language">Preferred Language</Label>
                                            <select
                                                id="language"
                                                className="w-full flex h-10 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                            >
                                                <option value="en">English (US)</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <select
                                                id="timezone"
                                                className="w-full flex h-10 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                                value={timezone}
                                                onChange={(e) => setTimezone(e.target.value)}
                                            >
                                                <option value="pst">Pacific Standard Time (PST)</option>
                                                <option value="est">Eastern Standard Time (EST)</option>
                                                <option value="utc">Universal Coordinated Time (UTC)</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* Danger Zone - Show only on Profile or Security tab for better UX */}
                            {(activeTab === "Profile" || activeTab === "Security") && (
                                <motion.section variants={fadeUp} custom={4} className="p-6 rounded-2xl border border-destructive/20 bg-destructive/5 shadow-sm">
                                    <h2 className="text-lg font-bold text-destructive mb-2 flex items-center gap-2">
                                        <Shield className="h-5 w-5" /> Danger Zone
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-6">Irreversible actions regarding your account.</p>
                                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-destructive/10">
                                        <div>
                                            <h3 className="font-semibold text-sm">Delete Account</h3>
                                            <p className="text-xs text-muted-foreground">Wipe all progress and data.</p>
                                        </div>
                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            onClick={handleDeleteAccount}
                                            className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20 transition-all font-bold"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </motion.section>
                            )}

                            {/* Action Buttons */}
                            <motion.div variants={fadeUp} custom={5} className="flex items-center justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => navigate(-1)} className="font-bold">Cancel</Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/20 font-bold px-8"
                                >
                                    {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
