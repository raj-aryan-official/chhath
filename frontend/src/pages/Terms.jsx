import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo.jsx';

const SECTIONS = [
  {
    title: 'Using the store',
    body: [
      'By browsing or ordering from KHARNA you agree to these terms. If you do not agree, please do not use the store.',
      'You must be at least 18 years old, or use the store under the supervision of a parent or guardian, and provide accurate information when creating an account or placing an order.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You are responsible for keeping your password private and for activity under your account. Tell us at once if you suspect someone else has access.',
      'We may suspend an account that is used for fraud, abuse or repeated policy violations.',
    ],
  },
  {
    title: 'Products and photographs',
    body: [
      'We describe every saree as honestly as we can. Handloom fabric has natural variations in weave and shade — these are part of the cloth, not a defect.',
      'Photographs are shot in daylight, but screens differ. If a colour is not what you expected, the return policy applies.',
    ],
  },
  {
    title: 'Prices and availability',
    body: [
      'Prices are in Indian rupees and include applicable GST unless stated otherwise. Delivery charges are shown at checkout.',
      'Stock is limited. If a saree sells out between your order and our confirmation, we will contact you and refund any amount already paid.',
    ],
  },
  {
    title: 'Orders and acceptance',
    body: [
      'Your order is an offer. It is accepted when we confirm it and, for prepaid orders, when payment is received.',
      'We may decline an order if information is incomplete, if fraud is suspected, or if a pricing error has occurred. Any payment already made for a declined order is refunded in full.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'Online payments are processed by Razorpay. Cash on Delivery is available on eligible orders. The options available to you are shown at checkout.',
      'For Cash on Delivery, payment is due when the parcel is delivered. Please keep the exact amount ready if possible.',
    ],
  },
  {
    title: 'Delivery, returns and refunds',
    body: [
      'Delivery timelines and the return policy are described on the Shipping & Returns page and form part of these terms.',
      'Risk in the goods passes to you on delivery. Please inspect the parcel and report damage within 48 hours.',
    ],
  },
  {
    title: 'Coupons',
    body: [
      'Coupons are offered at our discretion, cannot be exchanged for cash, and may have minimum order values, expiry dates or usage limits.',
      'One coupon can be applied per order unless we say otherwise. Misuse may lead to the coupon being withdrawn.',
    ],
  },
  {
    title: 'Content and reviews',
    body: [
      'The KHARNA name, logo, photographs and text belong to us and may not be used without permission.',
      'By posting a review you allow us to display it on the store. Reviews must be honest and must not contain abuse, personal data of others, or promotional links. We may remove reviews that break these rules.',
    ],
  },
  {
    title: 'Our responsibility',
    body: [
      'We work hard to keep the store accurate and available, but we do not promise uninterrupted access. To the extent the law allows, our responsibility for an order is limited to the amount you paid for it.',
      'Nothing in these terms limits rights you have under applicable consumer law.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of India. Courts at Patna, Bihar have jurisdiction, subject to any mandatory consumer forum rights.',
    ],
  },
];

export default function Terms() {
  return (
    <div className="container-page py-12 lg:py-16">
      <Seo
        title="Terms of use"
        description="The terms that apply when you browse or order from KHARNA — accounts, orders, pricing, payments, delivery, returns and content."
        path="/terms"
      />

      <div className="max-w-3xl">
        <p className="eyebrow">Policies</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Terms of use</h1>
        <p className="mt-2 text-xs uppercase tracking-wider text-bamboo-600">
          Last updated: November 2026
        </p>
        <p className="mt-4 text-base leading-relaxed text-bamboo-700">
          These terms keep the store fair for everyone. They are written to be read, not to hide
          things in small print.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-7">
          {SECTIONS.map((section, index) => (
            <section key={section.title} className="card-warm p-6 sm:p-7">
              <h2 className="font-display text-2xl text-ink">
                <span className="mr-2 text-sun-500">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-bamboo-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="card-warm p-6 sm:p-7">
            <h2 className="font-display text-2xl text-ink">Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
              Questions about these terms can be sent through the{' '}
              <Link to="/contact" className="text-flame-700 hover:text-sindoor-700">
                contact page
              </Link>
              .
            </p>
            <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
              Registered business name, GSTIN, studio address and grievance officer are placeholders
              until the company details are confirmed. TODO. These terms should be reviewed by a
              legal professional before launch.
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Related pages</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-flame-700 hover:text-sindoor-700">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-flame-700 hover:text-sindoor-700">
                  Shipping &amp; returns
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-flame-700 hover:text-sindoor-700">
                  FAQ
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-sun-300 bg-sun-50 p-5 text-sm leading-relaxed text-bamboo-700">
            <p className="font-medium text-ink">A note on faith</p>
            <p className="mt-1">
              Chhath is a living practice. Nothing on this store is meant to prescribe how you
              observe it. The rituals belong to you and your family; we only hope the cloth serves
              you well.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
