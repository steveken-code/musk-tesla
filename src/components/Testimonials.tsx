import { motion, AnimatePresence } from "framer-motion";
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Filter } from 'lucide-react';
import elonCeo from '@/assets/elon-ceo.jpeg';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState, useMemo } from 'react';

type FilterType = 'all' | 'location' | 'rating';
type LocationFilter = 'all' | 'USA' | 'Russia' | 'UK' | 'Singapore' | 'Canada';
type RatingFilter = 'all' | '5' | '4';

const Testimonials = () => {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: t('investor'),
      location: 'New York, USA',
      region: 'USA' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial1'),
      growth: '+1,250%',
    },
    {
      name: 'Михаил Петров',
      role: t('investor'),
      location: 'Moscow, Russia',
      region: 'Russia' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial2'),
      growth: '+890%',
    },
    {
      name: 'Emma Williams',
      role: t('investor'),
      location: 'London, UK',
      region: 'UK' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial3'),
      growth: '+18,000%',
    },
    {
      name: 'David Chen',
      role: t('investor'),
      location: 'Singapore',
      region: 'Singapore' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial4'),
      growth: '+2,340%',
    },
    {
      name: 'Анна Козлова',
      role: t('investor'),
      location: 'St. Petersburg, Russia',
      region: 'Russia' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: t('testimonial5'),
      growth: '+1,560%',
    },
    {
      name: 'James Wilson',
      role: t('investor'),
      location: 'Toronto, Canada',
      region: 'Canada' as LocationFilter,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      text: t('testimonial6'),
      growth: '+3,200%',
    },
  ];

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimonial) => {
      if (activeFilter === 'location' && locationFilter !== 'all') {
        return testimonial.region === locationFilter;
      }
      if (activeFilter === 'rating' && ratingFilter !== 'all') {
        return testimonial.rating === parseInt(ratingFilter);
      }
      return true;
    });
  }, [activeFilter, locationFilter, ratingFilter, testimonials]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [filteredTestimonials, emblaApi]);

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

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <Card className="h-full p-6 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 group relative overflow-hidden">
      {/* Growth Badge */}
      <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
        <span className="text-green-600 font-bold text-sm">{testimonial.growth}</span>
      </div>
      
      <div className="flex items-start gap-4 mb-4 pr-20">
        <div className="relative flex-shrink-0">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 group-hover:border-electric-blue transition-colors duration-300"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-base text-slate-900">{testimonial.name}</h4>
          <p className="text-sm text-slate-500">{testimonial.role}</p>
          <p className="text-xs text-slate-400">{testimonial.location}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        ))}
      </div>
      <p className="text-slate-600 group-hover:text-slate-800 transition-colors duration-300 text-sm leading-relaxed">
        "{testimonial.text}"
      </p>
    </Card>
  );

  const locations: LocationFilter[] = ['all', 'USA', 'Russia', 'UK', 'Singapore', 'Canada'];
  const ratings: RatingFilter[] = ['all', '5', '4'];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-100">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-20 left-0 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* CEO Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="max-w-4xl mx-auto mb-16 md:mb-20">
            <Card className="p-6 md:p-8 lg:p-12 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg group transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
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
                  <blockquote className="text-lg md:text-xl lg:text-2xl font-light text-slate-800 mb-4 italic leading-relaxed">
                    "{t('ceoQuote')}"
                  </blockquote>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                    <div className="h-1 w-12 md:w-16 bg-gradient-to-r from-tesla-red to-electric-blue rounded-full" />
                    <div>
                      <p className="font-bold text-lg md:text-xl text-slate-900">Elon Musk</p>
                      <p className="text-slate-500 text-sm md:text-base">CEO, Tesla & SpaceX</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            {t('testimonialTitle')}
          </h2>
          <p className="text-lg md:text-xl text-slate-600">
            {t('testimonialSubtitle')}
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Filter Type Buttons */}
            <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-md border border-slate-200">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setLocationFilter('all');
                  setRatingFilter('all');
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === 'all'
                    ? 'bg-tesla-red text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('location')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeFilter === 'location'
                    ? 'bg-tesla-red text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Location
              </button>
              <button
                onClick={() => setActiveFilter('rating')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeFilter === 'rating'
                    ? 'bg-tesla-red text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Star className="w-4 h-4" />
                Rating
              </button>
            </div>

            {/* Location Filter Options */}
            <AnimatePresence>
              {activeFilter === 'location' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocationFilter(loc)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                        locationFilter === loc
                          ? 'bg-electric-blue text-white border-electric-blue shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-electric-blue hover:text-electric-blue'
                      }`}
                    >
                      {loc === 'all' ? 'All Locations' : loc}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rating Filter Options */}
            <AnimatePresence>
              {activeFilter === 'rating' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {ratings.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border flex items-center gap-1 ${
                        ratingFilter === rating
                          ? 'bg-yellow-500 text-white border-yellow-500 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-yellow-500 hover:text-yellow-600'
                      }`}
                    >
                      {rating === 'all' ? (
                        'All Ratings'
                      ) : (
                        <>
                          {rating} <Star className="w-3 h-3 fill-current" />
                        </>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results count */}
          <p className="text-center text-slate-500 text-sm mt-4">
            Showing {filteredTestimonials.length} of {testimonials.length} testimonials
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="sm:hidden">
          {filteredTestimonials.length > 0 ? (
            <>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {filteredTestimonials.map((testimonial, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={scrollPrev}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                
                {/* Dots */}
                <div className="flex gap-2">
                  {filteredTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === selectedIndex 
                          ? 'bg-tesla-red w-6' 
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={scrollNext}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No testimonials match your filter.</p>
            </div>
          )}
        </div>

        {/* Desktop Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeFilter}-${locationFilter}-${ratingFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTestimonials.length > 0 ? (
              filteredTestimonials.map((testimonial, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <TestimonialCard testimonial={testimonial} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No testimonials match your filter.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Testimonials;