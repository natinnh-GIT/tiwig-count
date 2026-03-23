import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Zap, BarChart3, Shield } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-background flex flex-col items-center justify-center px-6 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 max-w-2xl">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Package className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">TIWIG Count

        </h1>
        
        <p className="text-sm text-muted-foreground">
          Manage your ammunition reloading inventory with precision and ease
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 py-3">
          <div className="p-3 rounded-xl bg-card border border-border">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <h3 className="font-semibold text-xs">Quick Add</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Snap photos or scan barcodes</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" />
            <h3 className="font-semibold text-xs">Track Inventory</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Monitor all categories</p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border">
            <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
            <h3 className="font-semibold text-xs">Secure Data</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Private and safe</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="w-full md:w-auto px-8">
          
          Get Started
        </Button>
      </div>
    </div>);

}