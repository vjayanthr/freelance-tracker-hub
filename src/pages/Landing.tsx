import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, Users, PieChart, Shield, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track time effortlessly with our intuitive timer interface"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Organize and manage your clients in one place"
    },
    {
      icon: PieChart,
      title: "Reports & Analytics",
      description: "Get insights into your productivity and earnings"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Up to 3 clients",
        "Basic time tracking",
        "Project management",
        "Simple reporting",
      ]
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      description: "Best for growing freelancers",
      features: [
        "Unlimited clients",
        "Advanced time tracking",
        "Detailed analytics",
        "Invoice generation",
        "Priority support",
      ],
      popular: true
    },
    {
      name: "Business",
      price: "$29",
      period: "/month",
      description: "For agencies and teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom branding",
        "API access",
        "Dedicated support",
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-primary">Freelance Hub</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 animate-fade-down">
          Track Time, <span className="text-primary">Boost Productivity</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up">
          The all-in-one platform for freelancers to track time, manage clients,
          and grow their business.
        </p>
        <div className="flex justify-center gap-4 animate-fade-up">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Start Free Trial
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="gap-2">
              Watch Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-xl shadow-sm border hover:border-primary transition-colors animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Choose the perfect plan for your freelance business. All plans include a 14-day free trial.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block mt-6">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of freelancers who are already saving time and growing their business.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">
            © 2024 Freelance Hub. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}