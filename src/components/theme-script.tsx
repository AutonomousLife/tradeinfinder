export function ThemeScript() {
  const code = `(() => {
    try {
      const stored = localStorage.getItem('tradeinfinder-theme');
      const theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    }
  })();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

