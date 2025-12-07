import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Zap,
  CheckCircle,
  Lock,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Shield className="w-6 h-6" />
            <span>SanitizeChain</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Blockchain-Verified IT Device Sanitization
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Secure, transparent, and certified data sanitization powered by
              blockchain. Track, verify, and certify every device sanitization
              with immutable records.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-border flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-24 h-24 text-primary/50 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Enterprise-Grade Data Security
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/20 py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-center">
            Comprehensive Device Sanitization Platform
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            A complete solution for managing, tracking, and certifying IT device
            sanitization with blockchain-backed verification.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Real-time Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor device sanitization status in real-time with detailed
                logs and timestamps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Blockchain Verification
              </h3>
              <p className="text-muted-foreground">
                Immutable records on blockchain ensure data integrity and
                prevent tampering.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Multi-Role Access
              </h3>
              <p className="text-muted-foreground">
                Role-based access control for Operators, Enterprises, Auditors,
                and Admins.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-muted-foreground">
                Comprehensive metrics and charts for monitoring sanitization
                activities.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Certificate Management
              </h3>
              <p className="text-muted-foreground">
                Generate, manage, and verify digital certificates for completed
                sanitizations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Audit Trail
              </h3>
              <p className="text-muted-foreground">
                Complete audit logs of all activities for compliance and
                accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-16 text-center">
            Tailored for Multiple User Roles
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                For Operators
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Log sanitization activities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Upload evidence and logs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Track device status
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                For Enterprise Users
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Manage device inventory
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Monitor sanitization processes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Download certificates
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                For Auditors
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Review audit trails
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Verify certificates
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Access compliance reports
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                For Administrators
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Manage users and roles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Configure system settings
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Monitor platform health
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Secure Your IT Assets?
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join enterprises worldwide in using blockchain-verified device
            sanitization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto text-primary-foreground hover:bg-primary/80"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-lg text-primary mb-4"
              >
                <Shield className="w-5 h-5" />
                <span>SanitizeChain</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Blockchain-based secure data sanitization platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SanitizeChain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
