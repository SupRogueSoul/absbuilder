import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Landing.module.css';

export default function Landing() {
  const router = useRouter();

  const handleCreateFreeWebsite = () => {
    router.push('/signup');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSeeHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>ABSBuilder - Build Stunning Websites with AI</title>
        <meta name="description" content="Generate complete, beautiful websites in seconds using Anthropic Claude AI. Describe your idea and watch it build live." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span>⚡</span> ABSBuilder
        </div>
        <div className={styles.navLinks}>
          <button onClick={handleSignIn} className={styles.btnText}>
            Sign In
          </button>
          <button onClick={handleCreateFreeWebsite} className={styles.btnPrimary}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.pulseDot}></span>
          <span>AI-powered website generation</span>
        </div>
        
        <h1 className={styles.heroTitle}>
          Build stunning websites with a single prompt
        </h1>
        
        <p className={styles.heroSub}>
          ABSBuilder takes your plain-English description and converts it into a production-ready, fully responsive HTML website in seconds.
        </p>

        <div className={styles.heroCtas}>
          <button onClick={handleCreateFreeWebsite} className={`${styles.btnPrimary} ${styles.heroBtn}`}>
            Create a free website →
          </button>
          <button onClick={handleSeeHowItWorks} className={`${styles.btnSecondary} ${styles.heroBtn}`}>
            See how it works
          </button>
        </div>

        {/* Browser Mockup */}
        <div className={styles.mockupContainer}>
          <div className={styles.mockupHeader}>
            <div className={styles.mockupDots}>
              <div className={`${styles.dot} ${styles.dotRed}`} />
              <div className={`${styles.dot} ${styles.dotYellow}`} />
              <div className={`${styles.dot} ${styles.dotGreen}`} />
            </div>
            <div className={styles.mockupAddress}>absbuilder.ai/project/new</div>
            <div style={{ width: '48px' }} /> {/* spacer */}
          </div>
          
          <div className={styles.mockupContent}>
            <div className={styles.mockupSidebar}>
              <div className={styles.sidebarTitle}>
                <span>🤖</span> AI Assistant
              </div>
              <textarea 
                className={styles.mockupPromptInput} 
                readOnly 
                value="Design a dark mode portfolio for a digital artist with grid gallery, neon highlights, and smooth scroll." 
              />
              <div className={styles.mockupStatusList}>
                <div className={styles.mockupStatusItem}>
                  <div className={`${styles.statusIndicator} ${styles.statusIndicatorActive}`} />
                  <span>Designing layout...</span>
                </div>
                <div className={styles.mockupStatusItem}>
                  <div className={styles.statusIndicator} />
                  <span>Choosing color palette...</span>
                </div>
                <div className={styles.mockupStatusItem}>
                  <div className={styles.statusIndicator} />
                  <span>Writing your code...</span>
                </div>
              </div>
            </div>
            
            <div className={styles.mockupPreview}>
              {/* Simulated visual layout edits using animations */}
              <div className={`${styles.simulatedCard} ${styles.simulatedCard1}`}>
                <div className={styles.simulatedHeader} />
                <div className={styles.simulatedLine} />
                <div className={`${styles.simulatedLine} ${styles.simulatedLineShort}`} />
              </div>
              
              <div className={`${styles.simulatedCard} ${styles.simulatedCard2}`}>
                <div className={styles.simulatedHeader} />
                <div className={styles.simulatedLine} />
                <div className={styles.simulatedLine} />
                <div className={`${styles.simulatedLine} ${styles.simulatedLineShort}`} />
              </div>
              
              <div className={`${styles.simulatedCard} ${styles.simulatedCard3}`}>
                <div className={styles.simulatedHeader} style={{ width: '25%' }} />
                <div className={`${styles.simulatedLine} ${styles.simulatedLineShort}`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Built for modern creators</h2>
        <p className={styles.sectionSub}>Everything you need to launch a beautiful site in minutes.</p>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>AI Design</h3>
            <p className={styles.featureDesc}>
              Elite-level typography, harmonious color schemes, and modern spacing crafted by Anthropic Claude.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Deploy Fast</h3>
            <p className={styles.featureDesc}>
              Instant publishing of generated pages, instantly downloadable single-file HTML outputs.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3 className={styles.featureTitle}>Chat to Edit</h3>
            <p className={styles.featureDesc}>
              Describe your edits in natural language. Add sections, change colors, or adjust layout components dynamically.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📱</div>
            <h3 className={styles.featureTitle}>Mobile-First</h3>
            <p className={styles.featureDesc}>
              Every generated site is fully responsive, looking perfect on desktop, tablet, and mobile displays.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌟</div>
            <h3 className={styles.featureTitle}>Custom Branding</h3>
            <p className={styles.featureDesc}>
              Specify your branding colors, typography preferences, and voice to match your visual identity.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3 className={styles.featureTitle}>Secure</h3>
            <p className={styles.featureDesc}>
              Your sites are built as clean, modern client-side HTML/CSS, removing server security overhead.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <p className={styles.sectionSub}>Generate and customize in three simple steps.</p>
        
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Describe your idea</h3>
            <p className={styles.stepDesc}>
              Enter a prompt describing your website’s goal, desired color palette, and general structure.
            </p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>AI Generation</h3>
            <p className={styles.stepDesc}>
              Our generation pipeline structures the layouts, styles, and scripts instantly.
            </p>
          </div>
          
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Edit via Chat</h3>
            <p className={styles.stepDesc}>
              Use the conversational sidebar to command Claude to adjust elements or add new pages of content.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.gradientBorderBox}>
          <h2 className={styles.ctaTitle}>Ready to build?</h2>
          <p className={styles.ctaDesc}>
            Join thousands of designers and developers using ABSBuilder to prototype and launch websites in record time.
          </p>
          <button onClick={handleCreateFreeWebsite} className={styles.btnPrimary}>
            Start Building Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>⚡ ABSBuilder</div>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} ABSBuilder Inc. Powered by Next.js & Anthropic.
          </p>
        </div>
      </footer>
    </div>
  );
}
