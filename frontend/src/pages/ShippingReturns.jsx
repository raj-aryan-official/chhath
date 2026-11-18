import { Link } from 'react-router-dom';
import { ClipboardCheck, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';

const STEPS = [
  {
    icon: ClipboardCheck,
    title: 'Write to us',
    copy: 'Message us within 7 days of delivery with your order number and a photo of the saree.',
  },
  {
    icon: RotateCcw,
    title: 'We arrange pickup',
    copy: 'We schedule a reverse pickup where service is available, or share a return address.',
  },
  {
    icon: PackageCheck,
    title: 'Refund or exchange',
    copy: 'Once the saree reaches us and passes inspection, we refund or exchange within 3–5 days.',
  },
];

export default function ShippingReturns() {
  return (
    <div className="container-page py-12 lg:py-16">
      <Seo
        title="Shipping & returns"
        description="KHARNA delivery timelines across India, delivery charges, the seven-day return policy and how refunds work."
        path="/shipping-returns"
      />

      <div className="max-w-2xl">
        <p className="eyebrow">Policies</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Shipping &amp; returns</h1>
        <p className="mt-3 text-base leading-relaxed text-bamboo-700">
          Clear timelines, careful packaging, and a fair return window — because a festival order
          should not feel like a gamble.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Reveal>
            <section className="card-warm p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
                <Truck className="h-5 w-5 text-flame-600" aria-hidden="true" />
                Delivery across India
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-sun-200 text-[11px] uppercase tracking-wider text-bamboo-600">
                      <th className="py-2 pr-4 font-medium">Region</th>
                      <th className="py-2 pr-4 font-medium">Working days</th>
                      <th className="py-2 font-medium">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sun-100">
                    <tr>
                      <td className="py-3 pr-4 text-bamboo-800">Bihar &amp; Jharkhand</td>
                      <td className="py-3 pr-4 text-bamboo-800">2–4</td>
                      <td className="py-3 text-bamboo-800">Free above ₹1,999, else ₹79</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-bamboo-800">Metro cities</td>
                      <td className="py-3 pr-4 text-bamboo-800">2–4</td>
                      <td className="py-3 text-bamboo-800">Free above ₹1,999, else ₹79</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-bamboo-800">Rest of India</td>
                      <td className="py-3 pr-4 text-bamboo-800">4–7</td>
                      <td className="py-3 text-bamboo-800">Free above ₹1,999, else ₹79</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
                Delivery charges and the free-delivery threshold are confirmed at checkout and may
                be updated in the store settings. Pincode-level estimates are not live yet. TODO:
                connect a serviceability API.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section className="card-warm p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Ordering for Chhath</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-bamboo-700">
                <li>
                  <span className="font-medium text-ink">Order early.</span> Ten days before Nahay
                  Khay is comfortable. We pack and dispatch in the order received.
                </li>
                <li>
                  <span className="font-medium text-ink">Keep the phone reachable.</span> Couriers
                  call before delivery, especially in smaller towns.
                </li>
                <li>
                  <span className="font-medium text-ink">Check the drape on arrival.</span> If you
                  plan to stitch the blouse, do it only after you are happy with the saree.
                </li>
                <li>
                  <span className="font-medium text-ink">Festival cut-off.</span> Dates change every
                  year. The current cut-off is noted at checkout. TODO: maintain the festival
                  cut-off date.
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section className="card-warm p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Returns in three steps</h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="rounded-2xl border border-sun-200 bg-cream p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-100 text-flame-700">
                      <step.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-bamboo-600">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-sm font-medium text-ink">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-bamboo-700">{step.copy}</p>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          <Reveal>
            <section className="card-warm p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">What can be returned</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-emerald-800">Accepted</h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-bamboo-700">
                    <li>Unused sarees with tags intact.</li>
                    <li>Unwashed, unstitched fabric with the fall not attached.</li>
                    <li>Wrong or damaged item received.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-sindoor-700">Not accepted</h3>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-bamboo-700">
                    <li>Custom-stitched blouses.</li>
                    <li>Washed, worn or altered sarees.</li>
                    <li>Returns raised after seven days.</li>
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="card-warm p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">Refunds</h2>
              <p className="mt-3 text-sm leading-relaxed text-bamboo-700">
                After inspection, prepaid refunds return to the original payment method in 5–7
                working days. Cash-on-delivery refunds are made by bank transfer to the account you
                share with our team. Shipping charges are refunded only when the return is due to a
                mistake on our side.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-bamboo-600">
                GST invoices are issued for every order. Business details for the invoice are
                placeholders until the company details are confirmed. TODO
              </p>
            </section>
          </Reveal>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Need help with a parcel?</h2>
            <p className="mt-2 text-sm leading-relaxed text-bamboo-700">
              Share your order number and we will look it up. We reply within one working day.
            </p>
            <div className="mt-4 space-y-2">
              <Button to="/contact" size="sm" className="w-full">
                Contact support
              </Button>
              <Button to="/account/orders" variant="secondary" size="sm" className="w-full">
                Track my order
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-sun-300 bg-sun-50 p-5 text-sm leading-relaxed text-bamboo-700">
            <p className="font-medium text-ink">Before you return</p>
            <p className="mt-1">
              Please do not use the saree for the ritual before deciding. Once it has been worn at
              the ghat, we cannot accept it back — for respect as much as for policy.
            </p>
            <Link
              to="/faq"
              className="mt-2 inline-block text-xs font-medium text-flame-700 hover:text-sindoor-700"
            >
              Read the FAQ →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
