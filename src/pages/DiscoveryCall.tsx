import React, { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { setPageMeta, injectJsonLd } from '@/src/lib/supabase';

const DiscoveryCall = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Discovery Call | Webnexa AI',
      description: 'Book a free 30-min strategy session with Webnexa AI.',
      url: window.location.origin + '/discovery-call'
    });
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Discovery Call',
      'url': window.location.origin + '/discovery-call'
    });
    (async function () {
      const cal = await getCalApi({ namespace: '30min' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    })();
  }, []);

  return (
    <section className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pt-32 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-6">Book Your Discovery Call</h1>
        <div className="h-[80vh]">
          <Cal
            namespace="30min"
            calLink="webnexaai/30min"
            style={{ width: '100%', height: '100%', overflow: 'scroll' }}
            config={{ layout: 'month_view' }}
          />
        </div>
      </div>
    </section>
  );
};

export default DiscoveryCall;
