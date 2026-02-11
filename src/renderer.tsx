import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TuloTech Africa - HR Management System</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .nav-item {
            transition: all 0.2s ease;
          }
          .nav-item:hover {
            transform: translateX(5px);
          }
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}</style>
      </head>
      <body class="bg-gray-50">
        {children}
        <script src="/static/app.js"></script>
        <script src="/static/app-views.js"></script>
        <script src="/static/app-payslips.js"></script>
        <script src="/static/app-payslips-professional.js"></script>
        <script src="/static/app-calendar.js"></script>
      </body>
    </html>
  )
})
