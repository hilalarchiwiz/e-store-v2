import React from 'react';
import Breadcrumbs from '@/components/v2/Breadcrumbs';

const ReturnsExchangesPage = () => {
  return (
    <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 md:py-16 flex flex-col gap-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Returns & Exchanges' }
        ]}
      />

      <div className="max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-[#121714] dark:text-white mb-6">
          Returns & Exchanges
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">
          At <strong>qaam.pk</strong>, we are committed to providing you with the highest quality eco-friendly products. If you are not completely satisfied with your purchase, we're here to help make things right.
        </p>

        <div className="grid gap-8">
          <div className="bg-white dark:bg-[#1a251d] p-8 rounded-3xl border border-[#f1f4f2] dark:border-[#2a3a2f] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">restart_alt</span>
              </div>
              <h2 className="text-2xl font-bold text-[#121714] dark:text-white">Our Return Policy</h2>
            </div>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed pl-2">
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                <span>You have <strong>14 days</strong> from the date of delivery to initiate a return or exchange.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                <span>Items must be unused, in their original condition, and in the original packaging.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                <span>Perishable goods, personal care items, and gift cards are generally exempt from being returned.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                <span>A receipt or proof of purchase from <strong>qaam.pk</strong> is required.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#1a251d] p-8 rounded-3xl border border-[#f1f4f2] dark:border-[#2a3a2f] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">swap_horiz</span>
              </div>
              <h2 className="text-2xl font-bold text-[#121714] dark:text-white">How to Exchange an Item</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              If you received a defective or damaged item, or simply need a different size, we are happy to exchange it for the same item. Please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 pl-2">
              <li>Contact our support team at <strong>support@qaam.pk</strong> with your order number.</li>
              <li>Provide clear photos if the item is defective or damaged.</li>
              <li>Wait for our team to approve your request and provide a return shipping address.</li>
              <li>Once we receive the original item, your replacement will be dispatched immediately.</li>
            </ol>
          </div>

          <div className="bg-white dark:bg-[#1a251d] p-8 rounded-3xl border border-[#f1f4f2] dark:border-[#2a3a2f] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <h2 className="text-2xl font-bold text-[#121714] dark:text-white">Refund Process</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
              <br/><br/>
              If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-10 business days. Shipping costs are non-refundable.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center p-8 bg-[#f1f4f2] dark:bg-[#2a3a2f] rounded-3xl">
          <h3 className="text-xl font-bold text-[#121714] dark:text-white mb-2">Still need help?</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Our customer service team is always ready to assist you with your qaam.pk orders.
          </p>
          <a href="/contact" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-lg active:scale-95">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
};

export default ReturnsExchangesPage;
