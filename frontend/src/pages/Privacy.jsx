import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo.jsx';

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'When you create an account we store your name, email address, phone number if you add one, and a securely hashed password. We never store the password itself.',
      'When you place an order we store the delivery address, the items you bought, the amount and the payment status. If you save addresses in your profile, they stay there until you delete them.',
      'Basic technical information — such as your browser type and the pages you visit — may be collected by our hosting and analytics providers to keep the store working.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'To create and secure your account, process orders, arrange delivery, handle returns, and answer your messages.',
      'To send order updates by email or SMS. We do not send marketing messages unless you ask for them.',
      'To keep the store safe — detecting abuse and preventing fraud on payments and returns.',
    ],
  },
  {
    title: 'Cookies and sign-in',
    body: [
      'We use a single essential cookie to keep you signed in. It is httpOnly, so scripts on the page cannot read it, and it expires after seven days of inactivity.',
      'Your bag is kept in your browser while you are signed out, and merged into your account when you sign in. We do not use advertising cookies at launch.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'Card, UPI and netbanking details are handled by Razorpay. KHARNA never sees or stores your full card number, CVV or UPI PIN. We receive only the payment identifier and the status needed to reconcile the order.',
      'Cash-on-delivery orders record that the payment status is pending until delivery.',
    ],
  },
  {
    title: 'Who we share with',
    body: [
      'Delivery partners receive the name, address and phone number needed to deliver the parcel.',
      'Razorpay receives payment information to process the transaction. Image hosting and email providers process data only as needed to run the store.',
      'We do not sell or rent your personal information. We share it when the law requires it, or when it is necessary to protect the store and its customers.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'Order records are kept for as long as tax and accounting rules require. Account details remain until you ask us to delete the account, unless we must keep a record for a legal reason.',
      'You can delete saved addresses and wishlist items yourself from your profile at any time.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can access and correct your profile details from your account, ask for a copy of your data, or ask us to delete your account by writing to the contact email below.',
      'You can unsubscribe from any non-essential message using the link in the message or by writing to us.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="container-page py-12 lg:py-16">
      <Seo
        title="Privacy policy"
        description="How KHARNA collects, uses and protects your personal information, including account data, orders, payments and cookies."
        path="/privacy"
      />

      <div className="max-w-3xl">
        <p className="eyebrow">Policies</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Privacy policy</h1>
        <p className="mt-2 text-xs uppercase tracking-wider text-bamboo-600">
          Last updated: November 2026
        </p>
        <p className="mt-4 text-base leading-relaxed text-bamboo-700">
          Your trust matters more than a sale. This page explains, in plain language, what we
          collect and why. If anything is unclear, write to us — we will explain it.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-7">
          {SECTIONS.map((section) => (
            <section key={section.title} className="card-warm p-6 sm:p-7">
              <h2 className="font-display text-2xl text-ink">{section.title}</h2>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-bamboo-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="card-warm p-6 sm:p-7">
            <h2 className="font-display text-2xl text-ink">Children</h2>
            <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
              The store is meant for adults. We do not knowingly collect information from children
              under 18. If a child has shared information, write to us and we will remove it.
            </p>
          </section>

          <section className="card-warm p-6 sm:p-7">
            <h2 className="font-display text-2xl text-ink">Contact and changes</h2>
            <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
              For any privacy question, write to our contact email. If this policy changes, the new
              version will be published here with a fresh date.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
              The registered business name, address and grievance officer are placeholders until
              the company details are confirmed. TODO. This policy should be reviewed by a legal
              professional before launch.
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Quick links</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-flame-700 hover:text-sindoor-700">
                  Terms of use
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-flame-700 hover:text-sindoor-700">
                  Shipping &amp; returns
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-flame-700 hover:text-sindoor-700">
                  Contact us
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-sun-300 bg-sun-50 p-5 text-sm leading-relaxed text-bamboo-700">
            <p className="font-medium text-ink">In short</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li>We collect only what an order needs.</li>
              <li>Passwords are hashed, never stored plainly.</li>
              <li>Payments go through Razorpay; card details never reach us.</li>
              <li>We never sell your data.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
