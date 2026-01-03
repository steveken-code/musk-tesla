import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, ArrowUpRight, BarChart3 } from 'lucide-react';
import elonPresentation from '@/assets/elon-presentation.webp';
import { motion } from 'framer-motion';

const StockGrowthChart = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('yearToDate'), value: '+247%', color: 'text-green-500' },
    { label: t('fiveYear'), value: '+1,250%', color: 'text-electric-blue' },
    { label: t('sinceIPO'), value: '+18,000%', color: 'text-tesla-red' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={elonPresentation}
          alt="Elon Musk presenting Tesla"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tesla-red/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-tesla-red/10 border border-tesla-red/30 rounded-full">
              <TrendingUp className="w-5 h-5 text-tesla-red" />
              <span className="text-sm font-medium text-tesla-red">{t('marketLeader')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('stockGrowthTitle')}
              <span className="block text-tesla-red">{t('exponentialGrowth')}</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              {t('stockGrowthDesc')}
            </p>

            {/* Stats */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-3 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card 
                    className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-tesla-red/50 transition-all duration-300 group"
                  >
                    <p className={`text-2xl md:text-3xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Chart Visualization */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <Card className="p-8 bg-gradient-to-br from-card via-muted/30 to-card border-border/50 overflow-hidden group hover:shadow-glow-red transition-all duration-500">
              {/* Fake Chart Visualization */}
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-8 h-8 text-tesla-red" />
                <div>
                  <h3 className="font-bold text-lg">TSLA</h3>
                  <p className="text-sm text-muted-foreground">NASDAQ: Tesla, Inc.</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-green-500">
                  <ArrowUpRight className="w-5 h-5" />
                  <span className="font-bold">+12.4%</span>
                </div>
              </div>

              {/* SVG Chart */}
              <div className="relative h-48 mb-4">
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[...Array(5)].map((_, i) => (
                    <line 
                      key={i}
                      x1="0" 
                      y1={i * 37.5} 
                      x2="400" 
                      y2={i * 37.5} 
                      stroke="hsl(var(--border))" 
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  ))}
                  
                  {/* Growth Line */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(0 72% 51%)" />
                      <stop offset="100%" stopColor="hsl(210 100% 50%)" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(0 72% 51%)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(0 72% 51%)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area Fill */}
                  <path
                    d="M 0 140 L 40 130 L 80 120 L 120 100 L 160 90 L 200 70 L 240 50 L 280 40 L 320 25 L 360 15 L 400 10 L 400 150 L 0 150 Z"
                    fill="url(#areaGradient)"
                    className="transition-all duration-1000"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 140 L 40 130 L 80 120 L 120 100 L 160 90 L 200 70 L 240 50 L 280 40 L 320 25 L 360 15 L 400 10"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="group-hover:stroke-[4] transition-all duration-300"
                  />
                  
                  {/* Data Points */}
                  {[[0, 140], [80, 120], [160, 90], [240, 50], [320, 25], [400, 10]].map(([x, y], i) => (
                    <circle 
                      key={i}
                      cx={x} 
                      cy={y} 
                      r="5" 
                      fill="hsl(var(--background))"
                      stroke="hsl(0 72% 51%)"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:r-8"
                    />
                  ))}
                </svg>
              </div>

              {/* Time Labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2019</span>
                <span>2020</span>
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
              </div>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-green-950 px-4 py-2 rounded-full font-bold animate-bounce">
              +$247.03 Today
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StockGrowthChart;
