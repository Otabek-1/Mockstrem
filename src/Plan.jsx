import React, { useState } from 'react'
import { FaCheck, FaCrown, FaGift } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'

export default function Plan() {
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  const features = [
    {
      name: 'Mock Passages',
      free: '✓ Limited (IELTS Reading only)',
      premium: '✓ Unlimited All Types'
    },
    {
      name: 'Writing Tasks',
      free: '✓ Basic feedback only',
      premium: '✓ AI-Powered detailed feedback'
    },
    {
      name: 'Speaking Practice',
      free: '✓ Record & self-review',
      premium: '✓ AI evaluation & suggestions'
    },
    {
      name: 'Full Mock Exam',
      free: false,
      premium: '✓ Real exam simulation'
    },
    {
      name: 'Results Timeline',
      free: '2-3 days',
      premium: 'Max 1 day'
    },
    {
      name: 'Writing Results',
      free: 'Basic score',
      premium: '✓ Detailed analysis + band breakdown'
    },
    {
      name: 'Speaking Results',
      free: 'Basic score',
      premium: '✓ Detailed analysis + band breakdown'
    },
    {
      name: 'Email Notifications',
      free: false,
      premium: '✓ Result ready alerts'
    },
    {
      name: 'Custom Plans',
      free: false,
      premium: '✓ Available'
    },
    {
      name: 'Priority Support',
      free: false,
      premium: '✓ 24/7 Chat support'
    },
    {
      name: 'Progress Analytics',
      free: 'Basic',
      premium: '✓ Advanced dashboard'
    },
    {
      name: 'Ad-Free Experience',
      free: false,
      premium: '✓ Clean interface'
    }
  ]

  const plans = [
    {
      name: 'Free',
      price: '0',
      period: '/forever',
      description: 'Start your IELTS journey',
      icon: <FaGift size={32} />,
      buttonText: 'Get Started',
      highlighted: false,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Premium',
      price: billingPeriod === 'monthly' ? '9.99' : '99.99',
      period: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Ace your IELTS exam',
      icon: <FaCrown size={32} />,
      buttonText: 'Upgrade Now',
      highlighted: true,
      color: 'from-purple-500 to-pink-600',
      badge: 'Most Popular'
    }
  ]

  const handleSendRequestForSubscription = () =>{
    alert("Your request has been sended successfully. Wait for response.")
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8'>
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Choose the plan that works best for you
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              billingPeriod === 'monthly'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              billingPeriod === 'yearly'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-bold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              plan.highlighted
                ? 'md:scale-105 shadow-2xl ring-2 ring-purple-500'
                : 'shadow-lg'
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Card */}
            <div className={`bg-gradient-to-br ${plan.color} p-0.5 rounded-2xl`}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                {/* Icon & Name */}
                <div className="text-center mb-6">
                  <div className={`inline-block p-3 rounded-full mb-3 ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900'
                      : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <div className={plan.highlighted ? 'text-purple-600 dark:text-purple-300' : 'text-blue-600 dark:text-blue-300'}>
                      {plan.icon}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-lg">
                      {plan.period}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.name === 'Premium' && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
                      That's only $8.33/month!
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button onClick={handleSendRequestForSubscription} className={`w-full py-3 rounded-lg font-bold mb-8 transition-all duration-200 transform hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}>
                  {plan.buttonText}
                </button>

                {/* Feature Highlights */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                    What's Included
                  </p>
                  {[
                    plan.name === 'Free' 
                      ? 'Limited mock passages' 
                      : 'Unlimited all mock types',
                    plan.name === 'Free'
                      ? 'Basic writing feedback'
                      : 'AI-powered detailed feedback',
                    plan.name === 'Free'
                      ? 'Self-review only'
                      : 'AI speaking evaluation',
                    plan.name === 'Premium' ? 'Full mock exams' : null,
                    plan.name === 'Premium' ? 'Results in 1 day max' : null,
                    plan.name === 'Premium' ? 'Email notifications' : null
                  ].filter(Boolean).map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <FaCheck className={plan.highlighted ? 'text-purple-500' : 'text-blue-500'} />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Comparison */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Detailed Feature Comparison
        </h2>

        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">
                  Feature
                </th>
                <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                  Free Plan
                </th>
                <th className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                  Premium Plan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800">
              {features.map((feature, idx) => (
                <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                    {feature.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof feature.free === 'string' ? (
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature.free}
                      </span>
                    ) : feature.free ? (
                      <FaCheck className="text-green-500 mx-auto" size={20} />
                    ) : (
                      <MdClose className="text-red-500 mx-auto" size={24} />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof feature.premium === 'string' ? (
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                        {feature.premium}
                      </span>
                    ) : feature.premium ? (
                      <FaCheck className="text-green-500 mx-auto" size={20} />
                    ) : (
                      <MdClose className="text-red-500 mx-auto" size={24} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Master Your IELTS?
          </h3>
          <p className="text-lg mb-8 text-blue-100">
            Upgrade to Premium and get instant access to all features
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 text-lg">
            Start Your Premium Trial
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, cancel your subscription anytime with no hidden fees.' },
            { q: 'Is there a free trial?', a: 'Free plan is always available to explore all features.' },
            { q: 'Do results get emailed?', a: 'Premium members get instant email when results are ready.' },
            { q: 'What payment methods?', a: 'We accept all major credit cards and digital wallets.' }
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {item.q}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}