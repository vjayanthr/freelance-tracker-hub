import AuthForm from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Start tracking your freelance work</p>
        </div>
        <AuthForm mode="register" />
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}