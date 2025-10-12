import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="container mx-auto px-4 py-12">
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
      {/* <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary">
                  Careers
                </Link>
              </li>
            </ul>
          </div> */}

      {/* Resources */}
      {/* <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-primary">
                  Returns
                </Link>
              </li>
            </ul>
          </div> */}

      {/* Legal */}
      {/* <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-primary">
                  Legal
                </Link>
              </li>
            </ul>
          </div> */}

      {/* Social */}
      {/* <div>
            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div> */}

      <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; 2025 CommerceHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
