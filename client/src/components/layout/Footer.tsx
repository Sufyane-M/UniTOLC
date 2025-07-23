import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">TP</div>
              <span className="ml-2 text-xl font-heading font-semibold text-primary dark:text-primary-400">TolcPrep</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">La piattaforma completa per prepararsi agli esami TOLC universitari in Italia.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="ri-facebook-circle-fill text-xl"></i>
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="ri-instagram-fill text-xl"></i>
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <i className="ri-twitter-x-fill text-xl"></i>
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Esami TOLC</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/resources?type=TOLC-I" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  TOLC-I
                </Link>
              </li>
              <li>
                <Link href="/resources?type=TOLC-E" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  TOLC-E
                </Link>
              </li>
              <li>
                <Link href="/resources?type=TOLC-F" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  TOLC-F
                </Link>
              </li>
              <li>
                <Link href="/resources?type=ENGLISH-TOLC" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  English TOLC
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Risorse</h3>
            <ul className="space-y-3">

              <li>

              </li>
              <li>
                <Link href="/resources?section=guide" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Guide
                </Link>
              </li>
              <li>
                <Link href="/resources?section=faq" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Supporto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contatti" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Contatti
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/termini" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Termini di servizio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            &copy; {new Date().getFullYear()} TolcPrep. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
