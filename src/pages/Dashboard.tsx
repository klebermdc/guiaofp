import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  Lock,
  MapPin,
  Hotel,
  Plane
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useGuideContact } from '@/hooks/useGuideContact';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TripCountdown } from '@/components/dashboard/TripCountdown';
import { MultipassStatusCard } from '@/components/multipass/MultipassStatusCard';
import { PushNotificationPrompt } from '@/components/notifications/PushNotificationPrompt';
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
  const getStatusIcon = () => {
    if (travelProfile.isLocked) return <Lock className="w-5 h-5" />;
    if (travelProfile.completionPercentage >= 100) return <CheckCircle2 className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (travelProfile.isLocked) return t('dashboard.profileStatus.locked');
    if (travelProfile.completionPercentage >= 100) return t('dashboard.profileStatus.complete');
    return t('dashboard.profileStatus.incomplete');
  };

  const getStatusColor = () => {
    if (travelProfile.isLocked) return 'border-l-muted-foreground';
    if (travelProfile.completionPercentage >= 100) return 'border-l-success';
    return 'border-l-warning';
  };

  return (
    <AppLayout>
      <motion.div 
        className="max-w-6xl mx-auto space-y-6 relative"
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
          className="relative overflow-hidden rounded-2xl gradient-primary p-8 text-primary-foreground"
        >
          <div className="absolute top-0 right-0 w-64 h-64 gradient-magic opacity-20 rounded-full blur-3xl" />
          
          <div className="relative">
            <motion.div 
              className="flex items-center gap-2 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-2xl">✨</span>
              <span className="text-secondary text-sm font-medium">{t('dashboard.exclusiveArea')}</span>
            </motion.div>
            <motion.h1 
              className="font-display text-3xl md:text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('dashboard.welcome')}, {user?.user_metadata?.name?.split(' ')[0] || 'Visitante'}!
            </motion.h1>
            <motion.p 
              className="text-primary-foreground/80 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('dashboard.tripBeingPrepared')}
            </motion.p>
          </div>
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

        {/* MultiPass Status Card (for premium clients) */}
        <motion.div variants={itemVariants}>
          <MultipassStatusCard />
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
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
                  <CardContent className="p-6 flex items-center gap-4">
                    <motion.div 
                      className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <User size={24} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('dashboard.profileCard.title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('dashboard.profileCard.subtitle')}</p>
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
                  <CardContent className="p-6 flex items-center gap-4">
                    <motion.div 
                      className="w-12 h-12 gradient-magic rounded-xl flex items-center justify-center text-accent-foreground"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Calendar size={24} />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t('dashboard.itineraryCard.title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('dashboard.itineraryCard.subtitle')}</p>
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
                    <CardContent className="p-6 flex items-center gap-4">
                      <motion.div 
                        className="w-12 h-12 bg-[hsl(142_70%_45%)] rounded-xl flex items-center justify-center text-white"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <MessageCircle size={24} />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-foreground">{t('dashboard.guideCard.title')} {guideName}</h3>
                        <p className="text-sm text-muted-foreground">{t('dashboard.guideCard.subtitle')}</p>
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
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                        <MessageCircle size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{t('dashboard.guideCard.noGuide')}</h3>
                        <p className="text-sm text-muted-foreground">{t('dashboard.guideCard.selectGuide')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Status Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {/* Profile Status */}
          <motion.div variants={itemVariants}>
            <Card variant="status" className={getStatusColor()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon()}
                    {t('dashboard.profileStatus.title')}
                  </CardTitle>
                  <motion.span 
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      travelProfile.completionPercentage >= 100 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                  >
                    {getStatusText()}
                  </motion.span>
                </div>
                <CardDescription>
                  {t('dashboard.profileStatus.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('dashboard.profileStatus.progress')}</span>
                    <span className="font-semibold">{travelProfile.completionPercentage}%</span>
                  </div>
                  <Progress value={travelProfile.completionPercentage} className="h-2" />
                  
                  {travelProfile.completionPercentage < 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link to="/perfil">
                        <Button variant="gold" size="sm" className="mt-4">
                          {t('dashboard.profileStatus.button')}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trip Summary */}
          <motion.div variants={itemVariants}>
            <Card variant="premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      y: [0, -3, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Plane className="w-5 h-5 text-accent" />
                  </motion.div>
                  {t('dashboard.tripSummary.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {travelProfile.arrivalDate ? (
                  <>
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dashboard.tripSummary.dates')}</p>
                        <p className="font-medium">
                          {travelProfile.arrivalDate} - {travelProfile.departureDate}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dashboard.tripSummary.parks')}</p>
                        <p className="font-medium">
                          {travelProfile.parks.length > 0 
                            ? travelProfile.parks.join(', ')
                            : t('dashboard.tripSummary.notDefined')
                          }
                        </p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Hotel className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dashboard.tripSummary.hotel')}</p>
                        <p className="font-medium">
                          {travelProfile.hotel || t('dashboard.tripSummary.notDefined')}
                        </p>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      {t('dashboard.tripSummary.fillProfile')}
                    </p>
                    <Link to="/perfil">
                      <Button variant="outline">
                        {t('dashboard.tripSummary.fillNow')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* WhatsApp CTA */}
        {hasGuide && (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 gradient-primary text-primary-foreground">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="font-display text-2xl font-bold mb-2">
                      {t('dashboard.needHelp.title')}
                    </h3>
                    <p className="text-primary-foreground/80">
                      {guideName} {t('dashboard.needHelp.subtitle')}
                    </p>
                  </div>
                  <motion.a 
                    href={whatsappUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="whatsapp" size="xl">
                      <MessageCircle size={24} />
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
