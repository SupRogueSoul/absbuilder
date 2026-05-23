import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth, useToast } from '../_app';
import styles from '../../styles/Builder.module.css';
import JSZip from 'jszip';

export default function Builder() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const { showToast } = useToast();

  const [site, setSite] = useState(null);
  const [html, setHtml] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [viewMode, setViewMode] = useState('desktop');
  
  // Loading states
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading project...');
  const [dbLoading, setDbLoading] = useState(true);
  
  // Chat states
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Rename states
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [isSavingRename, setIsSavingRename] = useState(false);
  const renameInputRef = useRef(null);

  const previewLoaderRef = useRef(null);
  const chatBottomRef = useRef(null);

  const quickPills = [
    'Make it a light theme',
    'Add testimonials section',
    'Change font to serif',
    'Add pricing table',
    'Make the hero bigger'
  ];

  const hasFetchedRef = useRef(false);

  // Auth & Project Load Check
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (!id) return; // Wait for router id query to resolve
    if (hasFetchedRef.current) return; // Prevent re-fetching on alt-tab / re-render
    hasFetchedRef.current = true;

    const fetchSiteDetails = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Supabase fetch error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        if (!data) {
          showToast('Project not found. Check if you have access to it.', 'error');
          router.push('/dashboard');
          return;
        }

        setSite(data);
        setHtml(data.generated_html || '');
        
        // Setup initial chat history
        setChatHistory([
          {
            id: 'init',
            sender: 'ai',
            text: `Your website "${data.name}" is live! Try asking: Change colors, Add a section, Make it light theme`
          }
        ]);
        
        // First 1.8s Loading state for Preview iframe
        setIsPreviewLoading(true);
        const loadingStages = ['Loading project...', 'Rendering components...', 'Starting preview...'];
        let stageIndex = 0;
        setLoadingText(loadingStages[0]);

        const stageInterval = setInterval(() => {
          stageIndex++;
          if (stageIndex < loadingStages.length) {
            setLoadingText(loadingStages[stageIndex]);
          }
        }, 600);

        const timer = setTimeout(() => {
          setIsPreviewLoading(false);
          clearInterval(stageInterval);
        }, 1800);

        return () => {
          clearTimeout(timer);
          clearInterval(stageInterval);
        };
      } catch (err) {
        console.error('Error fetching site details:', {
          message: err.message,
          code: err.code,
          details: err.details
        });
        showToast(`Failed to load project: ${err.message}`, 'error');
        router.push('/dashboard');
      } finally {
        setDbLoading(false);
      }
    };

    fetchSiteDetails();
  }, [id, user, loading]);

  // Scroll to bottom of chat history when history updates
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isThinking]);

  // Actions
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    showToast('HTML copied to clipboard!', 'success');
  };

  // ZIP Downloader compiling Vite environment structure
  const handleDownloadHtml = async () => {
    if (!site) return;
    
    showToast('Compiling project files...', 'success');

    try {
      const zip = new JSZip();

      // index.html
      zip.file('index.html', html);

      // package.json (Vite dev server configuration)
      const packageJson = {
        name: site.slug || 'abs-generated-site',
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        devDependencies: {
          "vite": "^5.2.11"
        }
      };
      zip.file('package.json', JSON.stringify(packageJson, null, 2));

      // vite.config.js
      const viteConfig = `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  }
});
`;
      zip.file('vite.config.js', viteConfig);

      // README.md
      const readme = `# ${site.name}

This website was generated by ABSBuilder using Google Gemini AI. 

We have packed it as a standard static project powered by **Vite** so you can easily run it locally or deploy it.

## 🚀 Getting Started

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
2. **Run Local Server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   This will boot up Vite on [http://localhost:3000](http://localhost:3000).

## 🛠️ Customization
Feel free to open \`index.html\` to make direct edits to styling, content, or script logic.

## 📦 Deployment
You can drag-and-drop this folder or connect it to:
- **Vercel** / **Netlify**
- **GitHub Pages**
`;
      zip.file('README.md', readme);

      // Generate the ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      
      const element = document.createElement('a');
      element.href = URL.createObjectURL(content);
      element.download = `${site.slug || 'website'}-project.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      showToast('Project ZIP downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to generate ZIP project folder:', err);
      showToast('Download failed. Could not pack project folder.', 'error');
    }
  };

  const handlePublish = () => {
    showToast('Your website has been successfully published!', 'success');
  };

  const handleStartRename = () => {
    if ((site.rename_count || 0) >= 2) {
      showToast('Rename limit reached. You can only rename a site 2 times.', 'error');
      return;
    }
    setRenameValue(site.name);
    setRenameError('');
    setIsRenaming(true);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setRenameError('');
  };

  const handleSaveRename = async () => {
    const newName = renameValue.trim();
    if (!newName) { setRenameError('Name cannot be empty.'); return; }
    if (newName === site.name) { setIsRenaming(false); return; }
    if (newName.length < 2) { setRenameError('Name must be at least 2 characters.'); return; }

    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    setIsSavingRename(true);
    setRenameError('');

    // Check global uniqueness
    const { data: existing } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', newSlug)
      .neq('id', site.id)
      .limit(1);

    if (existing && existing.length > 0) {
      setRenameError(`"${newName}" is already taken. Choose a different name.`);
      setIsSavingRename(false);
      return;
    }

    const { error } = await supabase
      .from('sites')
      .update({
        name: newName,
        slug: newSlug,
        initial: newName.charAt(0).toUpperCase(),
        rename_count: (site.rename_count || 0) + 1,
      })
      .eq('id', site.id);

    setIsSavingRename(false);

    if (error) {
      setRenameError('Failed to save. Please try again.');
      return;
    }

    setSite((prev) => ({
      ...prev,
      name: newName,
      slug: newSlug,
      initial: newName.charAt(0).toUpperCase(),
      rename_count: (prev.rename_count || 0) + 1,
    }));
    setIsRenaming(false);
    showToast(`Renamed to "${newName}" successfully!`, 'success');
  };

  const handleSendChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isThinking) return;

    const currentInput = chatInput;
    setChatInput('');

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: currentInput
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'edit',
          prompt: currentInput,
          currentHTML: html
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Editing failed');
      }

      if (data.fallback) {
        showToast('Demo Mode Fallback active. Gemini edit failed.', 'error');
      } else {
        showToast('Website updated successfully!', 'success');
      }

      setHtml(data.html);

      // Save updated HTML to Supabase Database
      const { error: updateError } = await supabase
        .from('sites')
        .update({ generated_html: data.html })
        .eq('id', site.id);

      if (updateError) throw updateError;

      // Update site details in state
      setSite((prev) => ({ ...prev, generated_html: data.html }));

      // Append AI response
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.fallback 
          ? "I wasn't able to complete the request with the AI model. Let me know if you would like me to try another edit."
          : `I've successfully updated your website to implement: "${currentInput}". Take a look at the preview panel.`
      };
      setChatHistory((prev) => [...prev, aiResponse]);

    } catch (err) {
      showToast('Could not process update. Please try again.', 'error');
      console.error(err);
      
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an error while updating the website. Please check your API key.'
      };
      setChatHistory((prev) => [...prev, aiResponse]);
    } finally {
      setIsThinking(false);
    }
  };

  const handlePillClick = (pill) => {
    setChatInput(pill);
  };

  const getIframeMaxWidth = () => {
    if (viewMode === 'mobile') return '375px';
    if (viewMode === 'tablet') return '768px';
    return '100%';
  };

  if (loading || dbLoading) {
    return (
      <div className={styles.container} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.previewSpinner}></div>
        <p style={{ marginTop: '16px', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Loading website workspace...
        </p>
      </div>
    );
  }

  if (!site) return null;

  const messageCount = chatHistory.filter((m) => m.id !== 'init').length;

  return (
    <div className={styles.container}>
      <Head>
        <title>ABSBuilder - Editing {site.name}</title>
      </Head>

      {/* Top Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <button onClick={() => router.push('/dashboard')} className={styles.btnBack}>
            ← Dashboard
          </button>
          <div className={styles.divider} />

          {isRenaming ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => { setRenameValue(e.target.value); setRenameError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); if (e.key === 'Escape') handleCancelRename(); }}
                style={{
                  background: 'var(--surface2, #13131e)',
                  border: renameError ? '1px solid #ef4444' : '1px solid var(--accent, #6c63ff)',
                  borderRadius: '6px',
                  color: 'var(--text, #f0f0ff)',
                  padding: '4px 10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  width: '180px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveRename}
                disabled={isSavingRename}
                style={{ background: 'var(--accent, #6c63ff)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              >
                {isSavingRename ? '...' : 'Save'}
              </button>
              <button
                onClick={handleCancelRename}
                style={{ background: 'transparent', color: 'var(--muted, #8888aa)', border: '1px solid var(--border, #1e1e2e)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              {renameError && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', maxWidth: '160px' }}>{renameError}</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.siteName}>{site.name}</span>
              {(site.rename_count || 0) < 2 ? (
                <button
                  onClick={handleStartRename}
                  title={`Rename (${2 - (site.rename_count || 0)} rename${2 - (site.rename_count || 0) === 1 ? '' : 's'} left)`}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted, #8888aa)', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}
                >
                  ✏️
                </button>
              ) : (
                <span title="Rename limit reached (2/2)" style={{ fontSize: '0.7rem', color: 'var(--muted, #8888aa)', opacity: 0.5 }}>✏️</span>
              )}
            </div>
          )}

          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Published
          </div>
        </div>

        <div className={styles.navCenter}>
          <button 
            onClick={() => setViewMode('desktop')} 
            className={`${styles.toggleBtn} ${viewMode === 'desktop' ? styles.toggleBtnActive : ''}`}
          >
            Desktop
          </button>
          <button 
            onClick={() => setViewMode('tablet')} 
            className={`${styles.toggleBtn} ${viewMode === 'tablet' ? styles.toggleBtnActive : ''}`}
          >
            Tablet
          </button>
          <button 
            onClick={() => setViewMode('mobile')} 
            className={`${styles.toggleBtn} ${viewMode === 'mobile' ? styles.toggleBtnActive : ''}`}
          >
            Mobile
          </button>
        </div>

        <div className={styles.navRight}>
          <button onClick={handleCopyHtml} className={`${styles.navBtn} ${styles.btnText}`}>
            Copy HTML
          </button>
          <button onClick={handleDownloadHtml} className={`${styles.navBtn} ${styles.btnText}`} title="Download complete package ZIP">
            Download Project
          </button>
          <button onClick={handlePublish} className={`${styles.navBtn} ${styles.btnPublish}`}>
            Publish
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.tabs}>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            >
              AI Chat
            </button>
            <button 
              onClick={() => setActiveTab('html')} 
              className={`${styles.tab} ${activeTab === 'html' ? styles.tabActive : ''}`}
            >
              HTML
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'chat' ? (
              <>
                <div className={styles.chatHeader}>
                  <span className={styles.chatTitle}>AI Assistant</span>
                  <span className={styles.messageCount}>{messageCount}/30</span>
                </div>

                <div className={styles.chatHistory}>
                  {chatHistory.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`${styles.message} ${msg.sender === 'ai' ? styles.aiMessage : styles.userMessage}`}
                    >
                      <span className={styles.messageSender}>
                        {msg.sender === 'ai' ? '🤖 Assistant' : '👤 You'}
                      </span>
                      <p className={msg.sender === 'ai' ? styles.messageText : ''}>{msg.text}</p>
                    </div>
                  ))}

                  {isThinking && (
                    <div className={`${styles.message} ${styles.thinkingMessage}`}>
                      <div className={styles.thinkingSpinner}></div>
                      <span>Updating website...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                <div className={styles.inputArea}>
                  <div className={styles.pillsRow}>
                    {quickPills.map((pill, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handlePillClick(pill)}
                        className={styles.pillBtn}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className={styles.inputRow}>
                    <input
                      type="text"
                      className={styles.chatInput}
                      placeholder="Ask the AI to change anything..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isThinking}
                    />
                    <button 
                      type="submit" 
                      className={styles.btnSend}
                      disabled={isThinking || !chatInput.trim()}
                    >
                      ↑
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className={styles.htmlHeader}>
                  <span className={styles.htmlTitle}>Raw Generated HTML</span>
                  <button onClick={handleCopyHtml} className={styles.btnCopyHtml}>
                    Copy
                  </button>
                </div>
                <div className={styles.htmlContainer}>
                  <pre className={styles.htmlCode}>
                    <code>{html}</code>
                  </pre>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Right Preview Panel */}
        <main className={styles.previewPanel}>
          {isPreviewLoading ? (
            <div className={styles.previewLoadingOverlay} ref={previewLoaderRef}>
              <div className={styles.previewSpinner}></div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar}></div>
              </div>
              <div className={styles.previewLoadingText}>{loadingText}</div>
            </div>
          ) : (
            <div 
              className={styles.previewWrapper} 
              style={{ maxWidth: getIframeMaxWidth() }}
            >
              <iframe
                srcDoc={html}
                sandbox="allow-scripts allow-same-origin"
                className={styles.iframeElement}
                onLoad={(e) => {
                  console.log('Iframe loaded successfully.');
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
