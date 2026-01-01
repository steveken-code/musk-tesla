import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';

const FAQ = () => {
  const faqs = [
    {
      question: 'Is this the real Tesla stock?',
      answer: 'Yes, we provide access to genuine Tesla (TSLA) stock investments through regulated and licensed financial partners. Your investments are backed by actual Tesla shares traded on major stock exchanges. We ensure full transparency and compliance with financial regulations.',
    },
    {
      question: 'How secure are my investments?',
      answer: 'Your investments are protected by bank-level SSL encryption and stored in secure, regulated accounts. We use multi-factor authentication, advanced fraud detection, and cold storage for assets. Our platform undergoes regular security audits by independent firms to ensure the highest level of protection.',
    },
    {
      question: 'How do I withdraw my profits?',
      answer: 'Withdrawing is simple! Go to your Dashboard, click on "Withdraw Funds," enter the amount you wish to withdraw, select your preferred payment method (cryptocurrency or bank transfer), and submit your request. Withdrawals are typically processed within 24-48 hours for crypto and 3-5 business days for bank transfers.',
    },
    {
      question: 'What is the minimum investment amount?',
      answer: 'You can start investing with as little as $100. This low entry barrier makes Tesla stock accessible to everyone, whether you\'re a beginner or an experienced investor looking to diversify your portfolio.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-gradient-to-b from-background via-slate-900/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium text-tesla-red bg-tesla-red/10 rounded-full border border-tesla-red/20">
            Support
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Got questions? We've got answers. Find everything you need to know about investing with us.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card/80 backdrop-blur-xl border border-border rounded-xl px-6 data-[state=open]:border-tesla-red/50 transition-colors"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-tesla-red py-6 hover:no-underline text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;