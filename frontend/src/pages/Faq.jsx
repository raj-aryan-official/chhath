import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';

const GROUPS = [
  {
    title: 'Orders & delivery',
    items: [
      {
        q: 'When should I order for Chhath?',
        a: 'We recommend ordering at least ten days before Nahay Khay so the saree reaches you with time for a fall and a wash. Orders placed closer to the festival are dispatched on priority, but delivery cannot be guaranteed. The exact cut-off for this year is confirmed by our team at checkout. TODO: confirm the cut-off date each year.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders leave our studio within 24–48 hours. Metro cities usually receive them in 2–4 working days and smaller towns in 4–7 working days. During the festive rush, add two days. Every parcel is tracked.',
      },
      {
        q: 'Can I change my delivery address after ordering?',
        a: 'If the order has not been packed, write to us with the order number and we will update the address. Once it is with the courier, the address cannot be changed.',
      },
      {
        q: 'Do you deliver outside India?',
        a: 'International delivery is not enabled at launch. For families abroad, write to us — we will help arrange a courier to an Indian address. TODO: enable international shipping if the business wants it.',
      },
    ],
  },
  {
    title: 'Fabric & care',
    items: [
      {
        q: 'How do I choose between cotton and Tussar?',
        a: 'Cotton is lighter and keeps you cool through the nirjala fast — ideal for Nahay Khay and Kharna. Tussar and Bhagalpuri silk hold a richer drape for Sandhya Arghya and Usha Arghya. Banarasi is for the evenings when the family gathers.',
      },
      {
        q: 'Are the colours exactly as shown?',
        a: 'We photograph sarees in daylight, but screens vary. Shades like saffron and marigold may appear slightly deeper on some phones. If the colour is not right when it arrives, you can return it within seven days.',
      },
      {
        q: 'How should I wash the saree?',
        a: 'Silk sarees are dry clean only. Cotton sarees can be hand washed in cold water with a mild detergent, dried in shade and ironed on low. Every product page lists the care for that piece.',
      },
      {
        q: 'Is a blouse piece included?',
        a: 'Most sarees include an unstitched blouse piece. A stitched blouse option is available on selected sarees for an additional charge. The exact details are shown on the product page before you add it to the bag.',
      },
    ],
  },
  {
    title: 'Returns & payments',
    items: [
      {
        q: 'What is the return policy?',
        a: 'Unused sarees with tags intact can be returned within seven days of delivery. The fall must not be stitched and the fabric must be unwashed. Custom-stitched blouses cannot be returned. See Shipping & Returns for the full policy.',
      },
      {
        q: 'How do refunds work?',
        a: 'Prepaid refunds return to the original payment method within 5–7 working days after we receive the parcel. Cash-on-delivery refunds are made by bank transfer to details you share with our team.',
      },
      {
        q: 'Which payment methods do you accept?',
        a: 'Cash on Delivery is available across India. Online payment through Razorpay is enabled once the store is configured with live keys. You will always see the available options at checkout before placing the order.',
      },
    ],
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
};

export default function Faq() {
  return (
    <div className="container-page py-12 lg:py-16">
      <Seo
        title="Frequently asked questions"
        description="Answers about Chhath saree orders, delivery timelines, fabric care, returns and payments at KHARNA."
        path="/faq"
        jsonLd={FAQ_JSON_LD}
      />

      <div className="max-w-2xl">
        <p className="eyebrow">Help</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Questions, answered</h1>
        <p className="mt-3 text-base leading-relaxed text-bamboo-700">
          The practical things families ask us before Chhath — delivery, drape, care and returns.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="font-display text-2xl text-ink">{group.title}</h2>
              <div className="mt-3 divide-y divide-sun-200 rounded-2xl border border-sun-200 bg-white/75">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-medium text-ink">
                      {item.q}
                      <ChevronDown
                        className="mt-0.5 h-4 w-4 shrink-0 text-flame-600 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 pr-8 text-sm leading-relaxed text-bamboo-700">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Still unsure?</h2>
            <p className="mt-2 text-sm leading-relaxed text-bamboo-700">
              A person, not a bot, will reply. Tell us the day you are dressing for and we will help
              you choose.
            </p>
            <div className="mt-4 space-y-2">
              <Button to="/contact" size="sm" className="w-full">
                Write to us
              </Button>
              <Button to="/shop" variant="secondary" size="sm" className="w-full">
                Browse the collection
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-sun-300 bg-sun-50 p-5 text-sm leading-relaxed text-bamboo-700">
            <p className="font-medium text-ink">Sizing help</p>
            <p className="mt-1">
              Every saree is 5.5 m with a 0.8 m blouse piece unless the product page says otherwise.
              For a stitched blouse, share your bust, waist and shoulder measurements after ordering.
            </p>
            <Link
              to="/shipping-returns"
              className="mt-2 inline-block text-xs font-medium text-flame-700 hover:text-sindoor-700"
            >
              Read the full policy →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
