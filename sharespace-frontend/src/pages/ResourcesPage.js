import Sidebar from '../components/Sidebar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Phone, ExternalLink, BookOpen, Heart } from 'lucide-react';

const ResourcesPage = ({ user, onLogout }) => {
  const helplines = [
    { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7', description: 'Free and confidential support for people in distress' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7', description: 'Free, 24/7 support for those in crisis' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7', description: 'Treatment referral and information service' },
    { name: 'NAMI HelpLine', number: '1-800-950-6264', available: 'Mon-Fri, 10am-10pm ET', description: 'Information, resource referrals and support' },
  ];

  const articles = [
    {
      title: 'Understanding Stress and How to Manage It',
      category: 'Stress Management',
      description: 'Learn effective techniques to identify, manage, and reduce stress in your daily life.',
      link: 'https://www.cdc.gov/mental-health/living-with/index.html'
    },
    {
      title: 'The Science of Burnout: Prevention and Recovery',
      category: 'Mental Health',
      description: 'Understand the signs of burnout and discover evidence-based strategies for prevention and healing.',
      link: 'https://www.helpguide.org/mental-health/stress/burnout-prevention-and-recovery'
    },
    {
      title: 'Cultivating Positivity: Daily Practices for Well-being',
      category: 'Wellness',
      description: 'Simple, scientifically-backed practices to build resilience and maintain positive mental health.',
      link: 'https://www.health.harvard.edu/topics/positive-psychology'
    },
    {
      title: 'Building Healthy Relationships',
      category: 'Relationships',
      description: 'Communication strategies and boundary-setting techniques for healthier connections.',
      link: 'https://www.betterhealth.vic.gov.au/health/healthyliving/relationships-and-communication'
    },
    {
      title: 'Mindfulness and Meditation for Beginners',
      category: 'Mindfulness',
      description: 'Getting started with mindfulness practices to reduce anxiety and improve focus.',
      link: 'https://www.mindful.org/meditation/mindfulness-getting-started/'
    },
    {
      title: 'Sleep Hygiene: Better Rest for Better Mental Health',
      category: 'Sleep',
      description: 'Evidence-based tips for improving sleep quality and its impact on mental well-being.',
      link: 'https://www.sleepfoundation.org/sleep-hygiene'
    },
  ];

  const counselingServices = [
    {
      name: 'BetterHelp',
      description: 'Online therapy platform connecting you with licensed therapists',
      link: 'https://www.betterhelp.com'
    },
    {
      name: 'Talkspace',
      description: 'Text, video, and audio therapy with licensed professionals',
      link: 'https://www.talkspace.com'
    },
    {
      name: 'Psychology Today',
      description: 'Find therapists, psychiatrists, and support groups near you',
      link: 'https://www.psychologytoday.com/us/therapists'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Mental Health Resources</h1>
            <p className="text-gray-600">Support is always available when you need it</p>
          </div>

          {/* Emergency Banner */}
          <Card className="p-6 bg-red-50 border-red-200 shadow-lg mb-8">
            <div className="flex items-start space-x-4">
              <Phone className="text-red-600 mt-1" size={32} />
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">In Crisis? Get Help Now</h3>
                <p className="text-red-700 mb-3">
                  If you're in immediate danger or experiencing a mental health emergency, please call 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full">
                  <Phone size={18} className="mr-2" />
                  Call 988
                </Button>
              </div>
            </div>
          </Card>

          {/* Helplines */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="mr-2 text-green-600" size={28} />
              24/7 Helplines
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {helplines.map((helpline) => (
                <Card key={helpline.name} className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{helpline.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">{helpline.number}</p>
                  <p className="text-sm text-gray-600 mb-2">{helpline.available}</p>
                  <p className="text-sm text-gray-700">{helpline.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Counseling Services */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="mr-2 text-blue-600" size={28} />
              Professional Counseling Services
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {counselingServices.map((service) => (
                <Card key={service.name} className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <a href={service.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full rounded-full">
                      <ExternalLink size={16} className="mr-2" />
                      Visit Website
                    </Button>
                  </a>
                </Card>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="mr-2 text-purple-600" size={28} />
              Educational Resources
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map((article) => (
                <Card key={article.title} className="p-6 bg-white/70 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{article.description}</p>
                  <a href={article.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="link" className="p-0 h-auto text-blue-600">
                    Read More →
                  </Button>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;