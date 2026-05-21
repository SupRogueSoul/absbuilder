import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth, useToast } from './_app';
import styles from '../styles/Dashboard.module.css';

// Default HTML template generator for mock sites
const generateSampleHTML = (title, description, primaryColor) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
    
    :root {
      --bg: #050508;
      --surface: #0d0d14;
      --text: #f0f0ff;
      --muted: #8888aa;
      --accent: ${primaryColor};
      --border: #1e1e2e;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      line-height: 1.6;
      padding: 0;
    }
    header {
      border-bottom: 1px solid var(--border);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--surface);
    }
    .logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--text);
    }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      margin-left: 24px;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--accent); }
    .hero {
      max-width: 800px;
      margin: 80px auto;
      text-align: center;
      padding: 0 20px;
    }
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: 3rem;
      line-height: 1.1;
      margin-bottom: 20px;
    }
    .hero p {
      color: var(--muted);
      font-size: 1.15rem;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      background-color: var(--accent);
      color: #fff;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2);
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(108, 99, 255, 0.4);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .card {
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 30px;
    }
    .card h3 {
      font-family: 'Syne', sans-serif;
      font-size: 1.2rem;
      margin-bottom: 12px;
    }
    .card p {
      color: var(--muted);
      font-size: 0.95rem;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 40px;
      text-align: center;
      color: var(--muted);
      font-size: 0.9rem;
      margin-top: 80px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">⚡ ${title}</div>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>
  </header>
  <section class="hero">
    <h1>${description}</h1>
    <p>Created automatically using ABSBuilder. Clean layouts, responsive components, and stunning design tokens.</p>
    <a href="#" class="btn">Get Started</a>
  </section>
  <div class="grid" id="features">
    <div class="card">
      <h3>Design Excellence</h3>
      <p>Beautiful typography and custom spacing tailored for your business needs.</p>
    </div>
    <div class="card">
      <h3>Fully Responsive</h3>
      <p>Optimized for mobile, tablet, and desktop viewports out of the box.</p>
    </div>
    <div class="card">
      <h3>Ultra Fast</h3>
      <p>Clean single-file delivery ensures standard-setting loading speeds.</p>
    </div>
  </div>
  <footer>
    <p>&copy; 2026 ${title}. All rights reserved.</p>
  </footer>
</body>
</html>`;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  
  const [sites, setSites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Designing layout...');
  const [dbLoading, setDbLoading] = useState(true);
  
  const statusIntervalRef = useRef(null);

  const statusMessages = [
    'Designing layout...',
    'Choosing color palette...',
    'Writing your code...',
    'Adding animations...',
    'Polishing details...'
  ];

  // Auth & DB Check
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchSites = async () => {
      setDbLoading(true);
      try {
        const { data: dbSites, error } = await supabase
          .from('sites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (dbSites && dbSites.length === 0) {
          // Pre-populate database with 2 sample sites
          const sampleSites = [
            {
              user_id: user.id,
              name: 'My Portfolio',
              slug: 'my-portfolio',
              color: '#6c63ff',
              initial: 'P',
              prompt: 'A premium portfolio website for a digital artist',
              generated_html: generateSampleHTML('My Portfolio', 'Creative Digital Artistry Portfolio', '#6c63ff')
            },
            {
              user_id: user.id,
              name: 'My SaaS Startup',
              slug: 'my-saas',
              color: '#a78bfa',
              initial: 'S',
              prompt: 'A landing page for an AI productivity tool startup',
              generated_html: generateSampleHTML('My SaaS Startup', 'Accelerating Creative Productivity', '#a78bfa')
            }
          ];

          const { data: inserted, error: insertError } = await supabase
            .from('sites')
            .insert(sampleSites)
            .select();

          if (insertError) throw insertError;
          setSites(inserted || []);
        } else {
          setSites(dbSites || []);
        }
      } catch (err) {
        console.error('Error fetching sites from Supabase:', err);
        showToast('Failed to load websites from database.', 'error');
      } finally {
        setDbLoading(false);
      }
    };

    fetchSites();
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (err) {
      showToast('Logout failed', 'error');
    }
  };

  const handleEdit = (site) => {
    router.push(`/builder/${site.id}`);
  };

  const handlePreview = (site) => {
    showToast(`Previewing ${site.name}...`, 'success');
    router.push(`/builder/${site.id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSites((prev) => prev.filter((site) => site.id !== id));
      showToast('Website deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Delete operation failed', 'error');
    }
  };

  const startStatusCycle = () => {
    let index = 0;
    setLoadingStatus(statusMessages[0]);
    statusIntervalRef.current = setInterval(() => {
      index = (index + 1) % statusMessages.length;
      setLoadingStatus(statusMessages[index]);
    }, 1.2 * 1000);
  };

  const stopStatusCycle = () => {
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => stopStatusCycle();
  }, []);

  const handlePromptSelect = (text) => {
    setPrompt(text);
  };

  const extractSiteName = (p) => {
    const lower = p.toLowerCase();
    if (lower.includes('portfolio')) return 'My Portfolio';
    if (lower.includes('shop') || lower.includes('store')) return 'My Shop';
    if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('coffee')) return 'My Restaurant';
    if (lower.includes('agency')) return 'My Agency';
    if (lower.includes('blog')) return 'My Blog';
    if (lower.includes('saas') || lower.includes('startup')) return 'My SaaS';

    const words = p
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => {
        const stopWords = ['a', 'an', 'the', 'website', 'design', 'make', 'build', 'for', 'of', 'and', 'to', 'in', 'with', 'on', 'my'];
        return w && !stopWords.includes(w.toLowerCase());
      });

    if (words.length >= 2) {
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      return `${cap(words[0])} ${cap(words[1])} Site`;
    } else if (words.length === 1) {
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      return `${cap(words[0])} Site`;
    }
    return 'My Awesome Site';
  };

  const handleCreate = async () => {
    if (!prompt.trim()) {
      showToast('Please describe your website first.', 'error');
      return;
    }

    setIsGenerating(true);
    startStatusCycle();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: 'generate', prompt }),
      });

      const data = await response.json();
      stopStatusCycle();

      if (!response.ok && !data.html) {
        throw new Error(data.message || 'Generation failed');
      }

      if (data.fallback) {
        showToast('Website generated with fallback content due to API limits or connection issues.', 'warning');
      }

      const siteName = extractSiteName(prompt);
      const randomColors = ['#6c63ff', '#a78bfa', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
      const siteColor = randomColors[Math.floor(Math.random() * randomColors.length)];

      const newSite = {
        user_id: user.id,
        name: siteName,
        slug: siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        color: siteColor,
        initial: siteName.charAt(0).toUpperCase(),
        prompt: prompt,
        generated_html: data.html
      };

      const { data: insertedSite, error: insertError } = await supabase
        .from('sites')
        .insert([newSite])
        .select()
        .single();

      if (insertError) throw insertError;

      showToast('Website generated successfully!', 'success');
      router.push(`/builder/${insertedSite.id}`);
    } catch (err) {
      stopStatusCycle();
      setIsGenerating(false);
      showToast('Generation failed. Check your API key or connection.', 'error');
      console.error('Error generating website:', err);
    }
  };

  const handleNextStep = () => {
    if (!prompt.trim()) {
      showToast('Please describe your website first.', 'error');
      return;
    }
    setStep(2);
  };

  if (loading || dbLoading) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner}></div>
        <p style={{ marginTop: '16px', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Builder';

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - ABSBuilder</title>
      </Head>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <span>⚡</span> ABSBuilder
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className={styles.userName}>{userDisplayName}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>My Websites</h1>
        </div>

        <div className={styles.grid}>
          {sites.map((site) => (
            <div key={site.id} className={styles.card} onClick={() => handleEdit(site)}>
              <div className={styles.cardThumbnail}>
                <div 
                  className={styles.thumbnailIcon} 
                  style={{ backgroundColor: site.color || 'var(--accent)' }}
                >
                  {site.initial}
                </div>
                <div className={styles.thumbnailSlug}>
                  {site.slug}.absbuilder.ai
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <h3 className={styles.cardName}>{site.name}</h3>
                  <p className={styles.cardDate}>
                    Created {new Date(site.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(site); }} 
                    className={`${styles.actionBtn} ${styles.btnEdit}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePreview(site); }} 
                    className={`${styles.actionBtn} ${styles.btnPreview}`}
                  >
                    Preview
                  </button>
                  <button 
                    onClick={(e) => handleDelete(site.id, e)} 
                    className={`${styles.actionBtn} ${styles.btnDelete}`}
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Dash Card (Create New) */}
          <div className={styles.createCard} onClick={() => { setStep(1); setPrompt(''); setIsModalOpen(true); }}>
            <div className={styles.createIcon}>＋</div>
            <div className={styles.createText}>Create New Website</div>
            <div className={styles.createSubtext}>Generate in seconds with AI</div>
          </div>
        </div>
      </main>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create New Website</h2>
              <button 
                onClick={() => !isGenerating && setIsModalOpen(false)} 
                className={styles.btnClose}
                disabled={isGenerating}
              >
                ✕
              </button>
            </div>

            {isGenerating ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <div className={styles.loadingStatus}>{loadingStatus}</div>
                <div className={styles.loadingSubText}>This may take up to 30-40 seconds...</div>
              </div>
            ) : (
              <>
                {/* Step Indicator */}
                <div className={styles.stepIndicator}>
                  <div className={`${styles.stepDot} ${step === 1 ? styles.stepDotActive : ''}`}>
                    <div className={styles.stepNumber}>1</div>
                    <span>Describe</span>
                  </div>
                  <div className={styles.stepLine} />
                  <div className={`${styles.stepDot} ${step === 2 ? styles.stepDotActive : ''}`}>
                    <div className={styles.stepNumber}>2</div>
                    <span>Review & Create</span>
                  </div>
                </div>

                {step === 1 ? (
                  <div className={styles.stepContent}>
                    <textarea
                      className={styles.promptTextarea}
                      placeholder="Describe the website you want to build. Be specific about purpose, pages, components, color schemes..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <span className={styles.suggestionsLabel}>Suggestions:</span>
                    <div className={styles.suggestionsGrid}>
                      <button 
                        onClick={() => handlePromptSelect('Modern tech SaaS website with landing page, hero, product features grid, interactive pricing, dark theme, and neon purple accents.')} 
                        className={styles.suggestionBtn}
                      >
                        🚀 SaaS Product
                      </button>
                      <button 
                        onClick={() => handlePromptSelect('Digital agency website with dark sleek mode, interactive services slider, case studies showcase, and email contact form.')} 
                        className={styles.suggestionBtn}
                      >
                        ⚡ Creative Agency
                      </button>
                      <button 
                        onClick={() => handlePromptSelect('Personal portfolio site for a software engineer with project cards, tech stack pills, light/dark responsive toggles, and direct links.')} 
                        className={styles.suggestionBtn}
                      >
                        👨‍💻 Dev Portfolio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.stepContent}>
                    <div className={styles.reviewBox}>
                      <strong>Prompt Summary:</strong>
                      <p style={{ marginTop: '8px', color: 'var(--muted)', fontSize: '0.85rem' }}>{prompt}</p>
                    </div>
                    <div className={styles.metaRow}>
                      <div className={styles.metaField}>
                        <span>🏷️ Extracted Name:</span>
                        <strong style={{ color: 'var(--accent2)' }}>{extractSiteName(prompt)}</strong>
                      </div>
                      <div className={styles.metaField}>
                        <span>🤖 Model:</span>
                        <strong style={{ color: 'var(--accent2)' }}>Gemini 2.5 Flash</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.modalFooter}>
                  {step === 1 ? (
                    <>
                      <button 
                        onClick={() => setIsModalOpen(false)} 
                        className={`${styles.modalBtn} ${styles.btnCancel}`}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleNextStep} 
                        className={`${styles.modalBtn} ${styles.btnGenerate}`}
                      >
                        Next Step
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setStep(1)} 
                        className={`${styles.modalBtn} ${styles.btnCancel}`}
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleCreate} 
                        className={`${styles.modalBtn} ${styles.btnGenerate}`}
                      >
                        Generate Website
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
