 // ============================================
 // Email Template Constants
 // Centralized styling for all email templates
 // ============================================
 
 // Branding
 export const PLATFORM_NAME = "Tesla Stock Platform";
 export const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
 export const DASHBOARD_URL = "https://msktesla.net/dashboard";
 export const WHATSAPP_DEFAULT = "+12186500840";
 
 // Colors - Light Theme (white background)
 export const COLORS = {
   // Text
   greetingText: "#374151",        // Dark gray - "Hello Name,"
   bodyText: "#374151",            // Dark gray - paragraph text
   secondaryText: "#6b7280",       // Medium gray - labels, captions
   mutedText: "#9ca3af",           // Light gray - disclaimers
   darkText: "#111827",            // Near black - important values
   
   // Accents
   sectionHeader: "#3b82f6",       // Electric Blue - section titles
   userNameHighlight: "#3b82f6",   // Electric Blue - name highlights (optional)
   successAmount: "#059669",       // Green - money values
   successText: "#166534",         // Dark green - success messages
   
   // Backgrounds
   cardBackground: "#f9fafb",      // Light gray - card backgrounds
   footerBackground: "#f9fafb",    // Light gray - footer
   
   // Borders
   cardBorder: "#e5e7eb",          // Light border
   divider: "#e5e7eb",             // Row dividers
   
   // Tesla Red (primary brand)
   teslaRed: "#dc2626",
   teslaRedDark: "#b91c1c",
   teslaRedDarkest: "#991b1b",
 };
 
 // Header gradient (Tesla Red)
 export const HEADER_GRADIENT = "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)";
 
 // Common styles
 export const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";