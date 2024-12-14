import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex justify-end p-4">
      <Button variant="ghost" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}