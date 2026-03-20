import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Zap, BarChart3, Shield } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-background flex flex-col items-center justify-center px-6 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Package className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          ReloadTrack
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Manage your ammunition reloading inventory with precision and ease
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          <div className="p-4 rounded-xl bg-card border border-border">
            <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Quick Add</h3>
            <p className="text-xs text-muted-foreground mt-1">Snap photos or scan barcodes instantly</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Track Inventory</h3>
            <p className="text-xs text-muted-foreground mt-1">Monitor quantities across all categories</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Secure Data</h3>
            <p className="text-xs text-muted-foreground mt-1">Your inventory stays private and safe</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          size="lg"
          onClick={() => navigate("/inventory")}
          className="w-full md:w-auto px-8"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}