import { HandHeart, Leaf, Moon, Sun, Sunrise, Waves } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import DiyaDivider from '../components/brand/DiyaDivider.jsx';
import { KharnaMark } from '../components/brand/KharnaLogo.jsx';
import { CHHATH_DAYS } from '../utils/constants.js';

const DAY_ICONS = [Waves, Moon, Sun, Sunrise];

const VALUES = [
  {
    icon: HandHeart,
    title: 'The weaver comes first',
    copy: 'We buy directly from handloom families in Bhagalpur and Mithila. No middlemen, no mystery in the price.',
  },
  {
    icon: Leaf,
    title: 'Fabric that respects the fast',
    copy: 'Breathable cotton and soft Tussar for long hours; richer silks for the evenings at the ghat.',
  },
  {
    icon: Sun,
    title: 'Dressed for the ritual, not the trend',
    copy: 'Every drape is chosen for how it sits in water, how it catches the sun, and how it feels to fold your hands in prayer.',
  },
];

export default function About() {
  return (
    <div className="pb-8">
      <Seo
        title="Our story"
        description="KHARNA is a small Bihar-born store for Chhath Puja sarees — woven with handloom families in Bhagalpur and Mithila, chosen for the four days of the festival."
        path="/about"
      />

      <section className="relative overflow-hidden border-b border-sun-200 bg-sunrise-soft">
        <div className="absolute inset-0 sun-rays opacity-70" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              A small shop for the women who keep the light.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-bamboo-800">
              KHARNA began with a simple memory: a mother folding a yellow saree before dawn,
              checking the border by lamplight, and walking to the ghat with a soop in her hands.
              We wanted a store that treated that moment with the care it deserves.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-bamboo-700">
              We work with weavers we know by name, choose fabric for the four days of Chhath, and
              write about each saree honestly. No loud sales, no gimmicks — just cloth that helps
              you stand in devotion.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/shop">Browse the collection</Button>
              <Button to="/contact" variant="secondary">
                Talk to us
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rounded-[2.5rem] border border-flame-300/50" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2rem] border border-sun-300 bg-cream shadow-warm-lg">
              <div className="sun-rays flex aspect-[4/5] flex-col items-center justify-center gap-5 p-8 text-center">
                <KharnaMark className="h-24 w-24 animate-float-y" />
                <p className="font-devanagari text-xl leading-relaxed text-sindoor-700">
                  छठ मैया की कृपा बनी रहे
                </p>
                <p className="max-w-[15rem] text-xs leading-relaxed text-bamboo-700">
                  Placeholder image. Real photographs of our weavers and sarees will live here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <Reveal>
          <SectionHeading
            eyebrow="What we believe"
            title="Three quiet promises"
            description="Small enough to keep, serious enough to matter."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <article className="card-warm h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun-100 text-flame-700">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-xl text-ink">{value.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-bamboo-700">{value.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sun-200 bg-white/60">
        <div className="container-page py-14">
          <Reveal>
            <div className="text-center">
              <p className="eyebrow">The four days</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Chhath, day by day</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-bamboo-700">
                Each day asks for a different mood — and a different drape. This is how we choose.
              </p>
            </div>
          </Reveal>

          <ol className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {CHHATH_DAYS.map((day, index) => {
              const Icon = DAY_ICONS[index];
              return (
                <Reveal key={day.name} delay={index * 0.06}>
                  <li className="relative h-full rounded-2xl border border-sun-200 bg-cream p-5">
                    <span className="font-display text-3xl text-sun-400">{day.numeral}</span>
                    <Icon className="absolute right-4 top-4 h-5 w-5 text-flame-500" aria-hidden="true" />
                    <h3 className="mt-2 font-display text-xl text-ink">{day.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-bamboo-700">{day.blurb}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="container-page py-14">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <DiyaDivider className="mx-auto" />
            <blockquote className="mt-4 font-display text-2xl leading-relaxed text-ink sm:text-3xl">
              “Pure fabric for your purest prayer.”
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-bamboo-700">
              That line has stayed with us since the first collection. It is the test every saree
              has to pass before it reaches the shop.
            </p>
            <p className="mt-6 text-xs text-bamboo-600">
              Our studio address, GSTIN and phone are placeholders until the business details are
              confirmed. TODO
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
