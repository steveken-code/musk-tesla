import { motion } from "framer-motion";
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Quote } from 'lucide-react';
import elonCeo from '@/assets/elon-ceo.jpeg';
import AnimatedSection from './AnimatedSection';

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: t('investor'),
      location: 'New York, USA',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial1'),
      growth: '+1,250%',
    },
    {
      name: 'Михаил Петров',
      role: t('investor'),
      location: 'Moscow, Russia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial2'),
      growth: '+890%',
    },
    {
      name: 'Emma Williams',
      role: t('investor'),
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial3'),
      growth: '+18,000%',
    },
    {
      name: 'David Chen',
      role: t('investor'),
      location: 'Singapore',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial4'),
      growth: '+2,340%',
    },
    {
      name: 'Анна Козлова',
      role: t('investor'),
      location: 'St. Petersburg, Russia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial5'),
      growth: '+1,560%',
    },
    {
      name: 'James Wilson',
      role: t('investor'),
      location: 'Toronto, Canada',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      text: t('testimonial6'),
      growth: '+3,200%',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-background">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* CEO Quote Section */}
        <AnimatedSection>
          <div className="max-w-4xl mx-auto mb-16 md:mb-20">
            <Card className="p-6 md:p-8 lg:p-12 bg-white dark:bg-card border-slate-200 dark:border-border/50 hover:border-tesla-red/30 transition-all duration-500 group shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-tesla-red/50 group-hover:border-tesla-red transition-colors duration-500">
                    <img 
                      src={elonCeo} 
                      alt="Elon Musk" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-tesla-red rounded-full p-2">
                    <Quote className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <blockquote className="text-lg md:text-xl lg:text-2xl font-light text-slate-800 dark:text-foreground mb-4 italic leading-relaxed">
                    "{t('ceoQuote')}"
                  </blockquote>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="h-1 w-12 md:w-16 bg-gradient-to-r from-tesla-red to-electric-blue rounded-full" />
                    <div>
                      <p className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">Elon Musk</p>
                      <p className="text-slate-600 dark:text-muted-foreground text-sm md:text-base">CEO, Tesla & SpaceX</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </AnimatedSection>

        {/* Section Header */}
        <AnimatedSection>
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-sm font-medium mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-foreground">
              {t('testimonialTitle')}
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-muted-foreground">
              {t('testimonialSubtitle')}
            </p>
          </div>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full p-6 bg-white dark:bg-card/90 backdrop-blur-sm border-slate-200 dark:border-border/50 hover:border-electric-blue/50 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                {/* Growth Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">{testimonial.growth}</span>
                </div>
                
                <div className="flex items-start gap-4 mb-4 pr-20">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-border group-hover:border-electric-blue transition-colors duration-300"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-card" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-base text-slate-900 dark:text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-foreground transition-colors duration-300 text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
