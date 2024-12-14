import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Success",
        description: "Password reset instructions have been sent to your email",
      });
      setIsResetMode(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="space-y-6 w-full max-w-sm mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive reset instructions
          </p>
        </div>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Send Reset Instructions
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsResetMode(false)}
          >
            Back to Login
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Freelance Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account or create a new one
        </p>
      </div>

      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="light"
        providers={[]}
      />

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setIsResetMode(true)}
      >
        Forgot Password?
      </Button>
    </div>
  );
}