import { Link, useLocation } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import { FaScrewdriverWrench } from 'react-icons/fa6';
import { getSession } from "../lib/session";
import "./footer.css";

const footerLinks = {
  Services: [
    { label: "Cleaning",  to: "/services?category=Cleaning"  },
    { label: "Handyman",  to: "/services?category=Handyman"  },
    { label: "Gardening", to: "/services?category=Gardening" },
    { label: "Moving",    to: "/services?category=Moving"    },
    { label: "Other",     to: "/services?category=Other"     },
  ],
  Company: [
    { label: "About Us",     to: "/about"   },
    { label: "How it Works", to: "/how"     },
    { label: "Become a Provider", to: "/sign-up?role=provider" },
    { label: "Blog",         to: "/blog"    },
  ],
  Support: [
    { label: "Help Center",    to: "/help"    },
    { label: "Safety",         to: "/safety"  },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Use",   to: "/terms"   },
  ],
};

const socials = [
  { icon: <FaInstagram />, href: "#", label: "Instagram" },
  { icon: <FaLinkedin />,  href: "#", label: "LinkedIn"  },
  { icon: <FaTwitter />,   href: "#", label: "Twitter"   },
  { icon: <FaFacebook />,  href: "#", label: "Facebook"  },
];

function Footer() {
  const location = useLocation();
  const session = getSession();
  const user = session?.user;

  // Hide footer on dashboard pages and for admin users
  if (location.pathname.toLowerCase().includes('dashboard') || user?.role === 'admin') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon"><FaScrewdriverWrench /></span>
            <span className="footer-logo-text">Fix<em>Hub</em></span>
          </Link>
          <p className="footer-tagline">
            Connecting clients with trusted service providers across Tunisia — fast, safe, and reliable.
          </p>
          <div className="footer-socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="social-btn" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group} className="footer-col">
            <h4 className="footer-col-title">{group}</h4>
            <ul className="footer-col-links">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>      
    </footer>
  );
}

export default Footer;