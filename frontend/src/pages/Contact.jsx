import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Seo from '../components/seo/Seo.jsx';
import Button from '../components/ui/Button.jsx';
import { toast } from '../store/index.js';

const schema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.enum(['order', 'fabric', 'returns', 'wholesale', 'other']),
  message: z.string().trim().min(10, 'A little more detail helps us help you').max(1200),
});

export default function Contact() {
  const contact = useSelector((state) => state.settings.settings?.contact);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: 'order', message: '' },
  });

  const onSubmit = async (values) => {
    // TODO: connect the contact form to your support inbox or a ticket tool.
    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success('Thank you. We have your note and will reply within one working day.');
    setSent(true);
    reset({ ...values, message: '' });
  };

  return (
    <div className="container-page py-12 lg:py-16">
      <Seo
        title="Contact us"
        description="Questions about a saree, an order or a return? Write to the KHARNA team — we reply within one working day."
        path="/contact"
      />

      <div className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Write to us</h1>
        <p className="mt-3 text-base leading-relaxed text-bamboo-700">
          Whether it is the drape of a Tussar or a delivery that needs tracking, a real person reads
          every message. We reply within one working day, Monday to Saturday.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section className="card-warm p-6 sm:p-8">
          <h2 className="font-display text-2xl text-ink">Send a message</h2>
          <p className="mt-1 text-sm text-bamboo-600">
            If your question is about an order, add the order number in the message.
          </p>

          {sent && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Your note is with us. If you added an email, a reply will reach you within one working
              day.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className="label-base">
                  Name
                </label>
                <input id="contact-name" type="text" className="input-base" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="label-base">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="input-base"
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="label-base">
                What is it about?
              </label>
              <select id="contact-subject" className="input-base" {...register('subject')}>
                <option value="order">An order</option>
                <option value="fabric">Fabric and drape</option>
                <option value="returns">Returns or exchange</option>
                <option value="wholesale">Wholesale and bulk orders</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="label-base">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={6}
                className="input-base"
                placeholder="Tell us what you need, and the order number if you have one."
                {...register('message')}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-700">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" loading={isSubmitting}>
              Send message
            </Button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Reach us</h2>
            <ul className="mt-4 space-y-3 text-sm text-bamboo-800">
              {contact?.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-flame-600" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="hover:text-sindoor-700">
                    {contact.email}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-flame-600" aria-hidden="true" />
                <span>{contact?.phone || 'Phone number: TODO'}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-600" aria-hidden="true" />
                <span>{contact?.address || 'Studio address: TODO'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-flame-600" aria-hidden="true" />
                <span>Monday to Saturday, 10 am – 6 pm IST</span>
              </li>
            </ul>
          </section>

          <section className="card-warm p-6">
            <h2 className="font-display text-xl text-ink">Faster answers</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-flame-700 hover:text-sindoor-700">
                  Read the FAQ
                </Link>
                <span className="text-bamboo-600"> — delivery, fabric and returns.</span>
              </li>
              <li>
                <Link to="/shipping-returns" className="text-flame-700 hover:text-sindoor-700">
                  Shipping &amp; returns
                </Link>
                <span className="text-bamboo-600"> — timelines and the exchange policy.</span>
              </li>
              <li>
                <Link to="/account/orders" className="text-flame-700 hover:text-sindoor-700">
                  Track an order
                </Link>
                <span className="text-bamboo-600"> — sign in to see its status.</span>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-sun-300 bg-sun-50 p-5 text-xs leading-relaxed text-bamboo-700">
            <p className="font-medium text-ink">Note</p>
            <p className="mt-1">
              The contact form is a front-end demo. Connect it to an inbox or support tool before
              launch. TODO
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
