import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MessageCircle, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useGuideContact } from '@/hooks/useGuideContact';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TripCountdown } from '@/components/dashboard/TripCountdown';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { DocumentWallet } from '@/components/dashboard/DocumentWallet';
import { TravelModeToggle } from '@/components/travel-mode/TravelModeToggle';
import { MultipassStatusCard } from '@/components/multipass/MultipassStatusCard';
import { PushNotificationPrompt } from '@/components/notifications/PushNotificationPrompt';
import { IOSNotificationCard } from '@/components/notifications/IOSNotificationCard';
import TripPlannerCard from '@/components/dashboard/TripPlannerCard';
import { SEO, SEO_PAGES } from '@/components/SEO';
import logo from '@/assets/logo.png';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  },
  tap: { scale: 0.98 }
};

const Dashboard = () => {
  const { user, travelProfile } = useAuth();
  const { isGuide, isLoading: isRoleLoading } = useUserRole();
  const { whatsappUrl, guideName, hasGuide } = useGuideContact();
  const { t } = useLanguage();
  
  // Redirect guides to their dedicated dashboard
  if (!isRoleLoading && isGuide) {
    return <Navigate to="/guia-dashboard" replace />;
  }

  return (
    <AppLayout>
      <SEO {...SEO_PAGES.dashboard} />
      <motion.div 
        className="max-w-6xl mx-auto space-y-4 sm:space-y-6 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Watermark Logo */}
        <div className="fixed bottom-8 right-8 opacity-10 pointer-events-none z-0 hidden lg:block">
          <img 
            src={logo} 
            alt="" 
            className="w-48 h-auto"
          />
        </div>

        {/* Welcome Header */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl gradient-primary p-5 sm:p-8 text-primary-foreground"
        >
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 gradient-magic opacity-20 rounded-full blur-3xl" />
          
          <div className="relative">
            <motion.div 
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xl sm:text-2xl">✨</span>
              <span className="text-secondary text-xs sm:text-sm font-medium">{t('dashboard.exclusiveArea')}</span>
            </motion.div>
            <motion.h1 
              className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('dashboard.welcome')}, {user?.user_metadata?.name?.split(' ')[0] || 'Visitante'}!
            </motion.h1>
            <motion.p 
              className="text-primary-foreground/80 text-sm sm:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('dashboard.tripBeingPrepared')}
            </motion.p>
          </div>
        </motion.div>

        {/* Travel Mode Toggle - Prominent position */}
        <motion.div variants={itemVariants}>
          <TravelModeToggle />
        </motion.div>

        {/* iOS Notification Card - Prominent for PWA users */}
        <motion.div variants={itemVariants}>
          <IOSNotificationCard />
        </motion.div>

        {/* Trip Countdown */}
        {travelProfile.arrivalDate && (
          <motion.div variants={itemVariants}>
            <TripCountdown 
              arrivalDate={travelProfile.arrivalDate}
              departureDate={travelProfile.departureDate}
              groupSize={travelProfile.groupSize}
              parks={travelProfile.parks}
            />
          </motion.div>
        )}

        {/* Weather Widget */}
        <motion.div variants={itemVariants}>
          <WeatherWidget 
            arrivalDate={travelProfile.arrivalDate}
            departureDate={travelProfile.departureDate}
          />
        </motion.div>

        {/* MultiPass Status Card (for premium clients) */}
        <motion.div variants={itemVariants}>
          <MultipassStatusCard />
        </motion.div>

        {/* Document Wallet */}
        <motion.div variants={itemVariants}>
          <DocumentWallet />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Link to="/perfil" className="block">
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 gradient-primary rounded-lg sm:rounded-xl flex items-center justify-center text-primary-foreground relative flex-shrink-0"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <User size={20} className="sm:w-6 sm:h-6" />
                      {/* Subtle status indicator */}
                      {travelProfile.completionPercentage >= 100 ? (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-success rounded-full flex items-center justify-center">
                          <CheckCircle2 size={10} className="sm:w-3 sm:h-3 text-success-foreground" />
                        </div>
                      ) : (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-warning rounded-full flex items-center justify-center">
                          <span className="text-[8px] sm:text-[10px] font-bold text-warning-foreground">{travelProfile.completionPercentage}%</span>
                        </div>
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{t('dashboard.profileCard.title')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {travelProfile.completionPercentage >= 100 
                          ? t('dashboard.profileStatus.complete')
                          : t('dashboard.profileCard.subtitle')
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link to="/agenda" className="block">
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Card variant="interactive" className="h-full">
                  <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 gradient-magic rounded-lg sm:rounded-xl flex items-center justify-center text-accent-foreground flex-shrink-0"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Calendar size={20} className="sm:w-6 sm:h-6" />
                    </motion.div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{t('dashboard.itineraryCard.title')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('dashboard.itineraryCard.subtitle')}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          {hasGuide ? (
            <motion.div variants={itemVariants}>
              <a 
                href={whatsappUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card variant="interactive" className="h-full">
                    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-[hsl(142_70%_45%)] rounded-lg sm:rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                      </motion.div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{t('dashboard.guideCard.title')} {guideName}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('dashboard.guideCard.subtitle')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </a>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Link to="/perfil" className="block">
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card variant="interactive" className="h-full">
                    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg sm:rounded-xl flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base">{t('dashboard.guideCard.noGuide')}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('dashboard.guideCard.selectGuide')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Unified Trip & Planner Card */}
        <motion.div variants={itemVariants}>
          <TripPlannerCard />
        </motion.div>

        {/* WhatsApp CTA */}
        {hasGuide && (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 gradient-primary text-primary-foreground">
              <CardContent className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="font-display text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                      {t('dashboard.needHelp.title')}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm sm:text-base">
                      {guideName} {t('dashboard.needHelp.subtitle')}
                    </p>
                  </div>
                  <motion.a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto flex-shrink-0"
                  >
                    <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
                      <MessageCircle size={20} className="sm:w-6 sm:h-6" />
                      {t('dashboard.needHelp.button')}
                    </Button>
                  </motion.a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Push Notification Prompt */}
        <PushNotificationPrompt />
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
